import Application, {
    AppConfigDict,
    AppExecuteContext,
    AppExecutePhase,
    ApplicationPlugin, ArgProcessors,
    ChatMessage
} from "./application";
import {msg} from "./commons";
import Timer from "./timer";
import RequestHelper from "./request";
import process from "process";

// The prompt
const defaultSystemPrompt = `
# Role: summarize assistant

## Description
You're an assistant who's good at extracting key takeaways from conversations and summarizing them.

# Rules
1. The summary needs to **maintain the user's language**.
2. Summarization should be limited to 400 tokens.

# Instructions
The content need to be summarize is located in the <chat_history></chat_history> group of xml tags.
User's words are quoted in <user></user>, appointment's words are quoted in <assistant></assistant>.

The summarized content will be used as context for subsequent prompts.
Please summarize according to the user's needs.

As a <Role>, you strictly follow <Rules>, be focused on the summarization.
`.trim()

// User message generator
function defaultUserPromptProvider(memories: ChatMessage[]) : string {
    let history = ""
    memories.forEach(({ role, content }) => {
        const tagName = role == "user" ? "user" : "assistant"
        history += `<${tagName}>${content}</${tagName}>\n`
    })
    return `
<chat_history>
${history}
</chat_history>

Please summarize the above conversation and retain key information.
`.trim()

}

export type HistorySummarizerConfig = {
    systemPrompt? : string,
    userPromptProvider? : (memories : ChatMessage[]) => string
}

/**
 * History Summarizer
 *
 * Require configuration property 'summarizeHistory'(int)
 */
export default class HistorySummarizer implements ApplicationPlugin {

    appendHelpMessage =
        "Summarization Options (Require --memory) :\n" +
        "    --summarize-after    INTEGER   Auto summarize after certain history (Env: LLM_CHAT_SUMMARIZE_AFTER).\n" +
        "\n"

    chainEvnProcessor(config : AppConfigDict) {
        config.summarizeHistory = parseInt(`${process.env["LLM_CHAT_SUMMARIZE_AFTER"]}`)
    }

    mergeArgProcessors : ArgProcessors = {
        "--summarize-after" : function (c, n) { c.summarizeHistory = parseInt(`${n(1)}`) },
    }

    private readonly systemPrompt : string
    private readonly userPromptProvider : (memories : ChatMessage[]) => string

    constructor(
        config? : HistorySummarizerConfig,
    ) {
        if(!config) {
            this.systemPrompt = defaultSystemPrompt
            this.userPromptProvider = defaultUserPromptProvider
            return
        }

        this.systemPrompt = config.systemPrompt || defaultSystemPrompt
        this.userPromptProvider = config.userPromptProvider || defaultUserPromptProvider
    }

    async execute(app : Application, context : AppExecuteContext) {
        if(context.phase !== AppExecutePhase.Post) return // Post phase only

        await this.onSummarize(app, context)
    }

    private async onSummarize(app : Application, context: AppExecuteContext) : Promise<void> {
        // Check environment
        const shouldSummarize = parseInt(`${app.getConfig("summarizeHistory")}`)
        if(!shouldSummarize || isNaN(shouldSummarize) || shouldSummarize <= 1) return
        const {chatMemory} = context
        if(!chatMemory) { msg("[[ Chat Memory not enabled, summarization will be SKIPPED ]]\n"); return }
        if(chatMemory.count < shouldSummarize) return
        chatMemory.flush()

        const { dataWriter } = context

        // Set summarize prompts
        context.systemPrompt = this.systemPrompt
        context.historyMessages = []
        context.userPrompt = this.userPromptProvider(chatMemory.clear()) // Also clear the memory

        const request = await app.profile.requestBuilder.bind(app)(context)
        await dataWriter(request)

        msg("$$ Summarization: ")
        const timer = new Timer()
        timer.start()
        await RequestHelper.streamContent(request, (line) => {
            if(!line) return
            dataWriter(line).then()

            timer.tick() && msg(`(Summarization context took ${timer.ctxInitTime()}s)\n`)
            const lineR = app.profile.responseLineTransformer(line)
            if(lineR == undefined) return
            const { content } = lineR
            if (content == undefined) return

            msg(content)
            chatMemory.appendAssistantOut(content)
        })
        timer.stop();
        msg("\n\n")
        const {avg, elapsed} = timer.sum()
        msg(`[[ Summarization took ${elapsed}s, Avg: ${avg} t/s ]]\n`);
    }
}