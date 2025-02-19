import {URL} from "url";

function urlNotNull(url: string): URL {
    const urlObj = URL.parse(url);
    if (urlObj == null) throw Error('Invalid URL: ' + url)
    return urlObj
}

class StreamCollector {
    private buffer = ''
    private readonly callback: (chunk: string) => void

    constructor(callback: (chunk: string) => void) {
        this.callback = callback
    }

    isClean() {
        return this.buffer == ''
    }

    getBuffer() {
        return this.buffer
    }

    feed(chunk: string): void {
        this.buffer += chunk
        while (true) {
            const newLineIndex = this.buffer.indexOf('\n');
            if (newLineIndex < 0) break;

            const line = this.buffer.slice(0, newLineIndex);
            this.buffer = this.buffer.slice(newLineIndex + 1);

            if (!line.trim()) continue;
            this.callback(line);
        }
    }
}

export type RequestConfig = { method: string, url: string, requestBody?: string, headers?: Record<string, string> }

export default class RequestHelper {
    private _http: any | null

    get http(): any {
        if (this._http == null) {
            this._http = require('http')
        }
        return this._http;
    }

    private _https: any | null;

    get https(): any {
        if (this._https == null) {
            this._https = require('https');
        }
        return this._https;
    }

    getConnector(protocol: string): any {
        let http: any | null = null;
        switch (protocol) {
            case 'https:':
                http = this.https
                break;
            case 'http:':
                http = this.http
                break;
            default:
                throw Error('Invalid protocol: ' + protocol);
        }
        return http
    }

    static instance = new RequestHelper();

    static streamContent(config: RequestConfig, callback: (chunk: string) => void): Promise<any> {
        const {method, url, requestBody, headers} = config;

        const urlObj = urlNotNull(url);
        let http = this.instance.getConnector(urlObj.protocol);

        return new Promise<void>((resolve, reject) => {
            const request = http.request(urlObj, {
                method, headers: {'Content-Type': 'application/json', ...(headers ? headers : {})},
            }, (response: any) => {
                if (response.statusCode !== 200) {
                    let errMsg = `[[ HTTP STATUS ${response.statusCode}, RESPONSE: \n`
                    new Promise<void>((r2) => {
                        response.on('data', (c: any) => errMsg += c)
                        response.on('end', r2)
                    }).then(() => reject(`${errMsg}\n]]`))
                    return
                }

                const handler = new StreamCollector(callback)
                response.on('data', handler.feed.bind(handler))
                response.on('end', () => {
                    if(!handler.isClean()) reject(new Error("Incomplete line receive: " + handler.getBuffer()));
                    else resolve()
                })
            })

            request.on('error', reject)
            if(requestBody) request.write(requestBody, (error : any) => error ? reject(error) : null)
            request.end()
        })
    }
}