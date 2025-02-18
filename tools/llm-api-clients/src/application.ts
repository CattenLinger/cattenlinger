import {msg} from './commons'
import fs from 'fs/promises'
import createDataWriter, {DataWriter} from "./data_writer";
import MemoryStorage from "./memory";
import Timer from "./timer";
import GlobalPostHook, {PostHook} from './post_hook'
import process from "process";
import RequestHelper, {RequestConfig} from "./request";

export type AppConfigDict = Record<string, any>

export type EnvProcessor = (this: Application, config: AppConfigDict) => any | void
export type ArgAccessor = (index: number) => string | void
export type ArgProcessors = Record<string, (this: Application, c: AppConfigDict, n: ArgAccessor) => string | void>
export type IncomeDataHandler = (this: Application, chunk: string, ctx: AppExecuteContext) => void

export type LLMApiRequest = RequestConfig

export type AppCustomizeConfig = {
    helpMessage: string,
    envProcessor: EnvProcessor,
    argTable: ArgProcessors,
    onResponseIncome: IncomeDataHandler,
    requestBuilder: (this: Application, ctx: AppExecuteContext) => Promise<LLMApiRequest>,
}

export type AppExecuteContext = {
    dataWriter: DataWriter,
    chatMemory: MemoryStorage | null,
    timer: Timer,
    postHook: PostHook,
    systemPrompt: string | null,
    messages: any[],
    prompt: string | null,
    model: string,
    serverUrl: string,
}

export default class Application {
    private args = process.argv
    readonly profile: AppCustomizeConfig

    private constructor(profile: AppCustomizeConfig) {
        this.profile = profile
    }

    private config: AppConfigDict = {}

    getConfig(key: string): string | null {
        return this.config[key]
    }

    printHelpAndExit(i: number) {
        msg(this.profile.helpMessage)
        process.exit(i)
    }

    private processArgs(reg: ArgProcessors) {
        const {args} = this
        if (!args || args.length <= 2) return this.printHelpAndExit(1)
        const {config} = this
        const lastArg = args[args.length - 1]
        if (lastArg.substring(0, 2) == '--') return this.printHelpAndExit(2)
        if (lastArg != '--') config["prompt"] = lastArg

        const options = args.slice(2, args.length - 1)
        if (options.length <= 0) return

        let op: string, i: number = 0

        const inbound = (function (this: Application, size: number) {
            i += size
            if (i < options.length) return options[i]
            msg("Require value for option: " + op + "\n\n\n")
            this.printHelpAndExit(i)
        }).bind(this)

        for (i = 0; i < options.length; i++) {
            op = options[i]
            if (op === '-') {
                config.prompt = null
                return;
            }
            const h = reg[op]
            if (!h) this.printHelpAndExit(4);
            h.bind(this)(config, inbound)
        }
    }

    private async prepareSystemRole(ctx: AppExecuteContext) {
        const systemPromptFile = this.getConfig("systemPrompt")
        if (systemPromptFile) {
            ctx.systemPrompt = await fs.readFile(systemPromptFile, {encoding: "utf8"})
            msg(`<< System Role >>\n`)
            msg(ctx.systemPrompt)
            msg("\n=================\n\n")
        }
    }

    private async prepareMemoryIfExists(ctx: AppExecuteContext) {
        const {chatMemory} = ctx
        if (!(chatMemory && chatMemory.isNotEmpty)) return

        const memories = chatMemory.memory
        for (const rec of memories) ctx.messages.push(rec)
        msg(`[[ Restored ${memories.length} chat histories. ]]\n`)
    }

    private async getPromptOrReadFromStdIn(ctx: AppExecuteContext) {
        let prompt = this.config["prompt"]
        if (prompt !== null && prompt.trim() != '') {
            ctx.prompt = prompt
            return
        }

        // Read from stdin
        process.stdin.on('data', chunk => prompt += chunk)
        await new Promise((resolve) => process.stdin.on('end', resolve))
    }

    static async launch(profile: AppCustomizeConfig) {
        const app = new Application(profile)
        profile.envProcessor.bind(app)(app.config)
        app.processArgs(profile.argTable)

        const model = app.getConfig("model")
        if (!model) {
            msg("Please specify LLM model.\n\n");
            app.printHelpAndExit(10)
        }

        const serverUrl = app.getConfig("serverUrl")
        if (!serverUrl) {
            msg("Please specify server url.\n\n");
            app.printHelpAndExit(11)
        }

        const context: AppExecuteContext = {
            dataWriter: await createDataWriter(app.config["out"]),
            chatMemory: app.config["memoryFile"] ? await MemoryStorage.create(app.config["memoryFile"]) : null,
            timer: new Timer(),
            postHook: GlobalPostHook,
            systemPrompt: null,
            messages: [],
            prompt: null,
            model: model!!,
            serverUrl: serverUrl!!
        }

        msg(`Server : ${context.serverUrl}\n`)
        msg(`Model  : ${context.model}\n`)
        msg(`\n`)

        await app.prepareSystemRole(context)
        await app.prepareMemoryIfExists(context)
        await app.getPromptOrReadFromStdIn(context)

        const {prompt, chatMemory, timer, dataWriter} = context

        msg(`<< Question : `)
        msg(`${prompt}\n`)
        msg(`>> Answer   : `)

        const requestConfig = await profile.requestBuilder.bind(app)(context)
        await dataWriter(JSON.stringify(requestConfig) + '\n')
        timer.start()
        await RequestHelper.streamContent(requestConfig, (chunk) => profile.onResponseIncome.bind(app)(chunk, context))
        timer.stop()

        if (chatMemory) GlobalPostHook.register(() => chatMemory.saveAsync());
        (({avg, elapsed}) => msg(`[[ Time elapsed: ${elapsed}s, Avg: ${avg} t/s ]]\n`))(timer.sum());

        return await GlobalPostHook.execute()
    }
}