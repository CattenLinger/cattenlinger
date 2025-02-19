import fs from 'fs/promises'
import GlobalPostHook from "./post_hook";
import {msg} from './commons'

export type DataWriter = (line: any) => Promise<any>

export default async function (out : string) : Promise<DataWriter> {
    if(!out) return ((_) => Promise.resolve())

    const file = await fs.open(out, "w")
    GlobalPostHook.register(async () => {
        await file.sync()
        await file.close()
        msg(`[[ LLM Response saved to file '${out}' ]]\n`)
    })
    return ((line) => file.write(`${(typeof line == "string") ? line : JSON.stringify(line)}\n`))
}