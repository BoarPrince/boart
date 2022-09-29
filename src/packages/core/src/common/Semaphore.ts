/**
 *
 */
export class Semaphore {
    private fns = [];
    private _active = 0;

    /**
     *
     * @param max maximum parallel tasks
     */
    constructor(private max = 1) {}

    /**
     *
     */
    get remaining() {
        return this.fns.length;
    }

    /**
     *
     */
    get active() {
        return this._active;
    }

    /**
     *
     */
    take(fn: (done: () => void) => void): void {
        this.fns.push(fn);
        this.tryCall();
    }

    /**
     *
     */
    private done(): void {
        this._active -= 1;
        this.tryCall();
    }

    /**
     *
     */
    private tryCall() {
        if (this._active === this.max || this.fns.length === 0) {
            return;
        }

        const fn = this.fns.shift();
        this._active += 1;

        if (fn) {
            fn(this.done.bind(this));
        }
    }
}
