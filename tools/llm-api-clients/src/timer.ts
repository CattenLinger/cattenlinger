export default class Timer {
    private startTime: number = 0
    private endTime: number = 0
    private responseStartTime: number = 0
    private tps: number[] = []

    start() {
        this.startTime = Date.now()
    }

    stop() {
        this.endTime = Date.now()
    }

    tick(): boolean {
        const now = Date.now()
        this.tps.push(now)

        if (this.responseStartTime <= 0) {
            this.responseStartTime = now
            return true
        }

        return false
    }

    sum(): { avg: number, elapsed: number } {
        const {tps, startTime, endTime} = this
        const tpsDelta : number[] = []
        for (let i = 0; i < (tps.length - 1); i++) tpsDelta.push(tps[i + 1] - tps[i])

        if (tpsDelta.length <= 0) return { avg: 0, elapsed: 0 }
        const avg = Math.ceil(1000000 / (tpsDelta.reduce((p, c,) => p + c) / tpsDelta.length)) / 1000
        const elapsed = Math.ceil(endTime - startTime) / 1000
        return {avg, elapsed}
    }

    ctxInitTime(): number {
        const {startTime, responseStartTime} = this
        return (Math.ceil(responseStartTime - startTime)) / 1000
    }
}