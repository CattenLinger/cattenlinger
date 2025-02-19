import {msg, print} from './commons'
import fs from 'fs/promises'
import createDataWriter, {DataWriter} from "./data_writer";
import MemoryStorage from "./memory";
import Timer from "./timer";
import GlobalPostHook from './post_hook'
import process from "process";
import RequestHelper, {RequestConfig} from "./request";

export type AppConfigDict = Record<string, any>

export type EnvProcessor = (this: Application, config: AppConfigDict) => any | void
export type ArgAccessor = (index: number) => string | void
export type ArgProcessors = Record<string, (this: Application, c: AppConfigDict, n: ArgAccessor) => string | void>
export type IncomeDataHandler = (this: Application, chunk: string, ctx: AppExecuteContext) => void

/** A chat message record. `role` means sender, `content` means the text */
export type ChatMessage = { role : string, content : string }

export interface ApplicationPlugin {
    /** Plugin help message */
    appendHelpMessage? : string

    /** Plug-in Env processor */
    chainEvnProcessor? : EnvProcessor

    /** Additional parameter processor */
    mergeArgProcessors? : ArgProcessors

    /** Application logic stubs */
    execute(app : Application, context : AppExecuteContext) : Promise<void>
}

/**
 * Usually, LLM response are event streams.
 *
 * ResponseLineTransformer represent a function that transforming
 * income text token response.
 */
export type ResponseLineTransformer = (line : string) => ResponseLineEvent
export type ResponseLineEvent = { content? : string, info? : any } | void

// The default income handler
const defaultIncomeDataHandler : IncomeDataHandler = function (chunk, { dataWriter, timer, chatMemory }) {
    if(!chunk) return

    const lineHandler = this.profile.responseLineTransformer

    dataWriter(chunk).then()
    timer.tick() && msg(`(Summarization context took ${timer.ctxInitTime()}s)\n`)

    const lineR = lineHandler(chunk)
    if (lineR == undefined) return
    const { info, content } = lineR
    if (info != undefined && (typeof info == 'string') ) msg(info)

    if (content == undefined) return
    print(content)
    chatMemory && chatMemory.appendAssistantOut(content)
}

export type AppCustomizeConfig = {
    helpMessage: string,
    envProcessor: EnvProcessor,
    argTable: ArgProcessors,
    requestBuilder: (this: Application, ctx: AppExecuteContext) => Promise<RequestConfig>,
    responseLineTransformer: ResponseLineTransformer,
    onResponseIncome?: IncomeDataHandler,
    plugins? : ApplicationPlugin[]
}

export enum AppExecutePhase { Pre, Post }

export type AppExecuteContext = {
    /** Data logger function */
    dataWriter: DataWriter,
    /** Chat memory manager */
    chatMemory: MemoryStorage | null,
    /** Chat request timer*/
    timer: Timer,
    /** System prompt for the chat request */
    systemPrompt: string | null,
    /** Extracted history messages */
    historyMessages: ChatMessage[],
    /** Prompt message for current chat request */
    userPrompt: string | null,
    /** LLM model to use */
    model: string,
    /** LLM API server url */
    serverUrl: string,
    /** Current Context Phase*/
    phase : AppExecutePhase
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
        const { plugins } = this.profile
        if(plugins) plugins.forEach(({ appendHelpMessage }) => {
            if(appendHelpMessage !== undefined) msg(appendHelpMessage)
        })
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

        const inbound = (size: number)  => {
            i += size
            if (i < options.length) return options[i]
            msg("Require value for option: " + op + "\n\n\n")
            this.printHelpAndExit(i)
        }

        for (i = 0; i < options.length; i++) {
            op = options[i]
            if (op === '-') { config.prompt = null; return; }
            const h = reg[op]
            if (!h) this.printHelpAndExit(4);
            h.bind(this)(config, inbound)
        }
    }

    private async prepareSystemRole(ctx: AppExecuteContext) {
        const systemPromptFile = this.getConfig("systemPrompt")
        if(!systemPromptFile) return

        ctx.systemPrompt = await fs.readFile(systemPromptFile, {encoding: "utf8"})
        msg(`<< System Role (name: ${this.getConfig("systemRole")}) >>\n`)
        msg(ctx.systemPrompt)
        msg("\n================\n\n")
    }

    private async prepareMemory(ctx: AppExecuteContext) {
        const {chatMemory} = ctx
        if (!(chatMemory && chatMemory.isNotEmpty)) return

        const memories = chatMemory.memory
        for (const rec of memories) ctx.historyMessages.push(rec)
        msg(`[[ Restored ${memories.length} chat histories. ]]\n`)
    }

    private async getPromptOrReadFromStdIn(ctx: AppExecuteContext) {
        let prompt = this.config["prompt"]
        if (prompt !== null && prompt.trim() != '') { ctx.userPrompt = prompt; return }

        // Read from stdin
        process.stdin.on('data', chunk => prompt += chunk)
        await new Promise((resolve) => process.stdin.on('end', resolve))
    }

    private handleParameters() {
        const { plugins } = this.profile;
        let envProcessors: EnvProcessor[] = [this.profile.envProcessor];
        let { argTable } = this.profile;
        if(plugins) plugins.forEach(({ chainEvnProcessor, mergeArgProcessors }) => {
            if(chainEvnProcessor !== undefined) envProcessors.push(chainEvnProcessor)
            if(mergeArgProcessors !== undefined) argTable = { ...argTable, ...mergeArgProcessors };
        });

        envProcessors.forEach(p => p.bind(this)(this.config))
        this.processArgs(argTable)
    }

    static async launch(profile: AppCustomizeConfig) : Promise<void> {
        const app = new Application(profile);
        app.handleParameters()

        const { plugins } = profile;

        const model = app.getConfig("model")
        if (!model) { msg("Please specify LLM model.\n\n"); app.printHelpAndExit(10); }

        const serverUrl = app.getConfig("serverUrl")
        if (!serverUrl) { msg("Please specify server url.\n\n"); app.printHelpAndExit(11); }

        msg(`Server : ${serverUrl}\n`)
        msg(`Model  : ${model}\n`)
        msg(`\n`)

        const context: AppExecuteContext = {
            dataWriter: await createDataWriter(app.config["out"]),
            chatMemory: app.getConfig("memoryFile") ? await MemoryStorage.create(app.config["memoryFile"]) : null,
            timer: new Timer(),
            systemPrompt: null,
            historyMessages: [],
            userPrompt: null,
            model: model!!,
            serverUrl: serverUrl!!,
            phase: AppExecutePhase.Pre
        }

        await app.prepareSystemRole(context)
        await app.prepareMemory(context)
        await app.getPromptOrReadFromStdIn(context)

        // Call Plugins
        if(plugins) await Promise.all(plugins.map(plugin => plugin.execute(app, context)))

        const {userPrompt, chatMemory, timer, dataWriter} = context

        msg(`<< Question : `)
        msg(`${userPrompt}\n`)
        msg(`>> Answer   : `)

        chatMemory && chatMemory.appendUserPrompt(userPrompt!!)

        // Build request
        const requestConfig = await profile.requestBuilder.bind(app)(context)

        // Get the response income transformer
        const responseHandler = (profile.onResponseIncome ? profile.onResponseIncome : defaultIncomeDataHandler).bind(app)

        // Log the request body to file
        await dataWriter(JSON.stringify(requestConfig))

        timer.start()
        await RequestHelper.streamContent(requestConfig, (chunk) => responseHandler(chunk, context))
        timer.stop()

        if (chatMemory) GlobalPostHook.register(() => chatMemory.saveAsync());
        (({avg, elapsed}) => {
            msg(`[[ Time elapsed: ${elapsed}s, Avg: ${avg} t/s ]]\n`)
        })(timer.sum());

        // Update phase and call plugins
        context.phase = AppExecutePhase.Post
        if(plugins) await Promise.all(plugins.map(plugin => plugin.execute(app, context)))

        await GlobalPostHook.execute()
    }
}