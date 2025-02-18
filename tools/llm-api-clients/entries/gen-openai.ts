#!/usr/bin/env node

import Application, {AppCustomizeConfig} from "../src/application";
import process from "process";
import {msg, print} from "../src/commons";

const profile : AppCustomizeConfig = {
    helpMessage:
        "Usage: gen-openai [options] prompt.\n\n" +
        "Options: \n" +
        "    --out    FILE          Output LLM response lines to FILE (env: OUT_FILE)\n" +
        "    --model  MODEL_NAME    Use model MODEL_NAME (env: LLM_MODEL)\n" +
        "    --server SERVER_URL    Use SERVER_URL as endpoint base name (env: SERVER_URL)\n" +
        "    --memory MEMORY_FILE   Use the given file to save the chat for continue (env: LLM_MEMORY_FILE)\n" +
        "\n" +
        "Note: '-' in arg list will stop param reading and take prompt from STDIN\n" +
        "\n" +
        "Env:\n" +
        "    OPENAI_API_KEY            OpenAI API Key, required.\n" +
        "    LLM_SYSTEM_PROMPT_FILE    Provide a text file as system prompt.\n" +
        "    LLM_SYSTEM_PROMPT_ROLE    Role name of system prompt, default is 'developer' (for old models please use 'system').\n" +
        "\n"
    ,

    envProcessor: (c) => {
        c.serverUrl    = process.env["SERVER_URL"] || "https://api.openai.com/v1"
        c.model        = process.env["LLM_MODEL"]      || "gpt-4o-mini"
        c.out          = process.env["OUT_FILE"]
        c.systemPrompt = process.env["LLM_SYSTEM_PROMPT_FILE"]
        c.apiKey       = process.env["OPENAI_API_KEY"]
        c.systemRole   = process.env["LLM_SYSTEM_PROMPT_ROLE"] || "developer"
        c.memoryFile   = process.env["LLM_CHAT_MEMORY"]
    },

    argTable: {
        "--out"    : function (c, n) { c.out = n(1) },
        "--model"  : function (c, n)  { c.model = n(1) },
        "--server" : function (c, n) { c.serverUrl = n(1) },
        "--memory" : function (c, n) { c.memoryFile = n(1) },
        "--help"   : function () { this.printHelpAndExit(0) },
    },

    async requestBuilder(ctx) {
        const apiKey = this.getConfig("apiKey")
        if(!apiKey) { msg("Please specify OpenAI API Key"); process.exit(1) }

        const { model, serverUrl } = ctx
        const body : Record<string,any> = {
            model,
            stream : true,
            stream_options : { include_usage: true }
        }

        const messages : any[] = []
        const {systemPrompt} = ctx
        const systemRole = this.getConfig("systemRole") || "developer"
        if(systemPrompt) messages.push({ role : systemRole, content : systemPrompt })

        messages.push(...ctx.messages)
        messages.push({ role: "user", content: ctx.prompt })
        body["messages"] = messages

        return {
            url: `${serverUrl}/chat/completions`,
            method: 'POST',
            headers: { "Authorization" : `Bearer ${apiKey}` },
            requestBody : JSON.stringify(body)
        }
    },

    onResponseIncome(line, { dataWriter, chatMemory, timer }) {
        if (!line) return

        dataWriter(line).then(() => [])
        timer.tick() && msg(`(Context initialize took ${timer.ctxInitTime()}s)\n`)

        let fields = line.match(/^data:\s+?(.+)/)
        if(!fields) return

        const [, payload] = fields
        if(payload === "[DONE]") return msg("\n\n")

        const {choices} = JSON.parse(payload);
        if(choices.length <= 0) return

        const { delta } = choices[0]
        if (!delta.content) return
        const { content } = delta
        if (!content) return
        print(content)
        chatMemory && chatMemory.appendAssistantOut(delta.content)
    }
}

Application.launch(profile).then().catch(console.error)