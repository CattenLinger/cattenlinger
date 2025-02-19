#!/usr/bin/env node
import Application, {AppCustomizeConfig} from "../src/application";
import process from "process";
import {msg} from "../src/commons";
import HistorySummarizer from "../src/summerizer";

const summarizeSystemPrompt = `
You're an assistant who's good at extracting key takeaways from conversations and summarizing them.
Please summarize according to the user's needs. The content you need to summarize is located in the <chat_history></chat_history> group of xml tags.
The summary needs to maintain the original language.

User's words are quoted in <user></user>. Your words are quoted in <assistant></assistant> group. Summarization should be limited to 400 tokens.
`.trim()

const profile : AppCustomizeConfig = {
    helpMessage:
        "Usage: gen-gemini [options] prompt.\n\n" +
        "Options: \n" +
        "    --out    FILE          Output LLM response lines to FILE (env: OUT_FILE)\n" +
        "    --model  MODEL_NAME    Use model MODEL_NAME (env: LLM_MODEL)\n" +
        "    --server SERVER_URL    Use SERVER_URL as endpoint base name (env: SERVER_URL)\n" +
        "    --memory MEMORY_FILE   Use the given file to save the chat for continue (env: LLM_MEMORY_FILE)\n" +
        "\n" +
        "Note: '-' in arg list will stop param reading and take prompt from STDIN\n" +
        "\n" +
        "Env:\n" +
        "    GEMINI_API_KEY            Google Gemini API Key, required.\n" +
        "    LLM_SYSTEM_PROMPT_FILE    Provide a text file as system prompt.\n" +
        "\n"
    ,

    argTable: {
        "--out"    : function (c, n) { c.out = n(1) },
        "--model"  : function (c, n) { c.model = n(1) },
        "--server" : function (c, n) { c.serverUrl = n(1) },
        "--memory" : function (c, n) { c.memoryFile = n(1) },
        "--help"   : function () { this.printHelpAndExit(0) },
    },

    envProcessor: (c) => {
        c.serverUrl    = process.env["SERVER_URL"] || "https://generativelanguage.googleapis.com"
        c.model        = process.env["LLM_MODEL"]      || "gemini-1.5-flash"
        c.out          = process.env["OUT_FILE"]
        c.apiKey       = process.env["GEMINI_API_KEY"]
        c.systemPrompt = process.env["LLM_SYSTEM_PROMPT_FILE"]
        c.memoryFile   = process.env["LLM_CHAT_MEMORY"]
    },

    async requestBuilder (ctx) {
        const apiKey = this.getConfig("apiKey")
        if (!apiKey) { msg("Please specify Gemini API Key.\n\n"); process.exit(1); }

        const { model, serverUrl } = ctx
        const body : Record<string, any> = {}

        const systemPrompt = ctx.systemPrompt
        if(ctx.systemPrompt) body["systemInstruction"] = { parts: { text: systemPrompt } }

        const messages : Record<string, any> = ctx.historyMessages.map(e => ({ role: e.role, parts: [{ text : e.content }] }))
        messages.push({ role: "user", parts : [{ text : ctx.userPrompt }] })

        body["contents"] = messages

        return {
            url: `${serverUrl}/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
            method: 'POST',
            requestBody: JSON.stringify(body)
        }
    },

    responseLineTransformer : line => {
        let fields = line.trim().match(/^data:\s+?(.+)/)
        if(!fields) return
        const [, payload] = fields
        if(!payload.trim()) return

        const {candidates} = JSON.parse(payload);
        if(candidates.length <= 0) return

        const { content } = candidates[0]
        if(!content) return
        const { parts } = content
        if(!parts || parts.length <= 0) return
        const { text } = parts[0]
        return { content: text }
    },

    plugins: [
        new HistorySummarizer(),
    ]
}

Application.launch(profile).then().catch(console.error)