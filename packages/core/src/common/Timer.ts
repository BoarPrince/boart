/**
 *
 */
export class Timer {
    private _duration: number;
    private start: [number, number];
    /**
     *
     */
    constructor() {
        this._duration = null;
        this.start = process.hrtime();
    }

    /**
     *
     */
    stop() {
        const end = process.hrtime(this.start);
        this._duration = end[0] + end[1] / 1000000;
        return this;
    }

    /**
     *
     */
    get duration(): string {
        return this._duration.toFixed(2);
    }

    /**
     *
     */
    toString() {
        return `${this.duration} sec`;
    }
}
