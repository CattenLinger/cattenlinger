import fs from 'fs/promises'
import {msg} from './commons'

export type MemoryRecord = { role: string, content: string }

export default class MemoryStorage {
    private messages: MemoryRecord[]
    private responseBuffer: string | null = null
    private memFile: string

    private constructor(memoryFile: string, messages: MemoryRecord[]) {
        this.messages = messages
        this.memFile = memoryFile
    }

    get isNotEmpty(): boolean {
        return this.messages.length > 0
    }

    get memory(): MemoryRecord[] {
        return [...this.messages]
    }

    static async create(memoryFile: string) {
        let memory
        try {
            msg(`[[ Chat memory: '${memoryFile}' ]]\n`)
            await fs.access(memoryFile)
            const content = await fs.readFile(memoryFile, 'utf8')
            const jsonContent = JSON.parse(content)
            if (typeof jsonContent === 'object' && jsonContent !== null) memory = jsonContent
        } catch (e) {

        }

        return new MemoryStorage(memoryFile, memory.message ? memory.message : [])
    }

    async saveAsync() {
        // Push the assistant response
        if (this.responseBuffer) this.messages.push({"role": "assistant", content: this.responseBuffer})

        const memory = {messages: this.messages}
        await fs.writeFile(this.memFile, JSON.stringify(memory))
        msg(`[[ Chat history saved: '${this.memFile}' ]]\n`)
    }

    appendAssistantOut(str: string) {
        if (!this.responseBuffer) this.responseBuffer = ""
        this.responseBuffer += str
    }

    userResponse(content: string) {
        this.messages.push({role: "user", content})
    }
}