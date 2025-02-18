#!/usr/bin/env node
import Application, {AppCustomizeConfig} from '../src/application'
import process from "process";
import {msg, print} from "../src/commons";

const profile : AppCustomizeConfig = {
    helpMessage:
        "Usage: gen-ollama [options] PROMPT\n\n" +
        "Options: \n" +
        "    --out    FILE          Output LLM response lines to FILE (env: OUT_FILE)\n" +
        "    --model  MODEL_NAME    Use model MODEL_NAME (env: LLM_MODEL)\n" +
        "    --server SERVER_URL    Use SERVER_URL as endpoint base name (env: SERVER_URL)\n" +
        "    --memory MEMORY_FILE   Use the given file to save the chat for continue (env: LLM_MEMORY_FILE)\n" +
        "\n" +
        "Note: '-' in arg list will stop param reading and take prompt from STDIN\n" +
        "\n" +
        "Env:\n" +
        "    LLM_SYSTEM_PROMPT_FILE    Provide a text file as system prompt.\n" +
        "    LLM_KEEP_ALIVE            How long for keep LLM model in memory, default is '5m'.\n" +
        "    LLM_SYSTEM_PROMPT_ROLE    Role name of system prompt, default is 'system'.\n" +
        "    LLM_CTX_WINDOW_SIZE       Context window size, default is 2048.\n" +
        "\n",

    envProcessor : c => {
        c.serverUrl      = process.env["SERVER_URL"] || "http://127.0.0.1:11434"
        c.model          = process.env["LLM_MODEL"]
        c.out            = process.env["OUT_FILE"]
        c.systemPrompt   = process.env["LLM_SYSTEM_PROMPT_FILE"]
        c.modelKeepAlive = process.env["LLM_KEEP_ALIVE"]
        c.memoryFile     = process.env["LLM_CHAT_MEMORY"]
        c.systemRole     = process.env["LLM_SYSTEM_PROMPT_ROLE"] || "system"
        c.llmCtxSize     = process.env["LLM_CTX_WINDOW_SIZE"]
    },

    argTable : {
        "--out"    : function (c, n) { c.out        = n(1) },
        "--model"  : function (c, n) { c.model      = n(1) },
        "--server" : function (c, n) { c.serverUrl  = n(1) },
        "--memory" : function (c, n) { c.memoryFile = n(1) },
        "--help"   : function () { this.printHelpAndExit(0) },
    },

    async requestBuilder (ctx) {
        const body : Record<string,any> = { model: ctx.model }

        // Build message
        const contents : any[] = []
        const systemRoleName = this.getConfig("systemRole") || "system"
        if(ctx.systemPrompt) contents.push({ role: systemRoleName, content: ctx.systemPrompt })
        contents.push(...ctx.messages)
        contents.push({ role: "user", content: ctx.prompt })
        body["messages"] = contents

        // Parameters
        const modelKeepAlive = this.getConfig("modelKeepAlive")
        if(modelKeepAlive) body["keep_alive"] = parseInt(modelKeepAlive)

        const llmCtxSize = this.getConfig("llmCtxSize")
        if(llmCtxSize) body["num_ctx"] = parseInt(llmCtxSize)

        return {
            url : `${ctx.serverUrl}/api/chat`,
            method: 'POST',
            requestBody : JSON.stringify(body),
        }
    },

    onResponseIncome(line, { dataWriter, chatMemory, timer }) {
        if (!line) return

        let data
        try {
            data = JSON.parse(line);
            if (data === null) return;
        } catch (_) {
            throw new Error(`Invalid JSON in line: ${line}`)
        }

        dataWriter(JSON.stringify(data)).then(() => [])

        if (timer.tick()) msg(`(Context initialize took ${timer.ctxInitTime()}s)\n`)

        const {message, done} = data;

        if (done) return msg("\n\n")
        const {content} = message
        print(content)

        chatMemory && chatMemory.appendAssistantOut(content)
    }
}

Application.launch(profile).then().catch(console.error)