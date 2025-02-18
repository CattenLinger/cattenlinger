export class PostHook {
    private tasks: (() => Promise<any>)[] = []

    register(task : () => Promise<any>) {
        this.tasks.push(task)
    }

    execute() : Promise<any> {
        return Promise.all(this.tasks.map(task => task()))
    }
}

export default new PostHook()