/**
 *
 */
export class Timer {
    private _duration: number;
    private start: bigint;
    private startTimeISO: string;
    private endTimeISO: string;
    /**
     *
     */
    constructor() {
        this._duration = null;
        this.start = process.hrtime.bigint();
        this.startTimeISO = new Date().toISOString();
    }

    /**
     *
     */
    stop() {
        const end = process.hrtime.bigint();
        const duration = end - this.start;
        this._duration = Number(duration) / 1000 / 1000 / 1000;
        this.endTimeISO = new Date().toISOString();
        return this;
    }

    /**
     * calculates the iso time
     */
    get startTime(): string {
        return this.startTimeISO;
    }

    /**
     * calculates the iso time
     */
    get endTime(): string {
        if (!this.endTimeISO) {
            this.stop();
        }
        return this.endTimeISO;
    }

    /**
     *
     */
    get duration(): string {
        if (!this._duration) {
            this.stop();
        }
        return this._duration.toFixed(2);
    }

    /**
     *
     */
    toString() {
        return `${this.duration} sec`;
    }
}
