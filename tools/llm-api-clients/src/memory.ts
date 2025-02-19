import fs from 'fs/promises'
import {msg} from './commons'
import {ChatMessage} from "./application";

export default class MemoryStorage {
    private readonly messages: ChatMessage[]
    private readonly memFile: string

    private responseBuffer: string | null = null

    private constructor(memoryFile: string, messages: ChatMessage[]) {
        this.messages = messages
        this.memFile = memoryFile
    }

    get isNotEmpty(): boolean {
        return this.messages.length > 0
    }

    get memory(): ChatMessage[] {
        return [...this.messages]
    }

    get count() : number {
        return this.messages.length
    }

    clear() : ChatMessage[] {
        return this.messages.splice(0, this.messages.length)
    }

    flush() : boolean {
        if (!this.responseBuffer) return false
        this.messages.push({"role": "assistant", content: this.responseBuffer})
        this.responseBuffer = ''
        return true
    }

    static async create(memoryFile: string) {
        let memory : Record<string, any> = { messages: [] }
        try {
            msg(`[[ Chat memory: '${memoryFile}' ]]\n`)
            await fs.access(memoryFile)
            const content = await fs.readFile(memoryFile, 'utf8')
            const jsonContent = JSON.parse(content)
            if (typeof jsonContent === 'object' && jsonContent !== null) memory = jsonContent
        } catch (e) {

        }

        return new MemoryStorage(memoryFile, memory["messages"] ? memory["messages"] : [])
    }

    async saveAsync() {
        // Push the assistant response
        this.flush()

        const memory = {messages: this.messages}
        await fs.writeFile(this.memFile, JSON.stringify(memory))
        msg(`[[ Chat history saved: '${this.memFile}' ]]\n`)
    }

    appendAssistantOut(str: string) {
        if (!this.responseBuffer) this.responseBuffer = ""
        this.responseBuffer += str
    }

    appendUserPrompt(content: string) {
        this.messages.push({role: "user", content})
    }
}