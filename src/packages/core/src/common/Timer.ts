/**
 *
 */
export class Timer {
    private _duration: number;
    private start: [number, number];
    private startTimeISO: string;
    private endTimeISO: string;
    /**
     *
     */
    constructor() {
        this._duration = null;
        this.start = process.hrtime();
        this.startTimeISO = new Date().toISOString();
    }

    /**
     *
     */
    stop() {
        const end = process.hrtime(this.start);
        this._duration = (end[0] * 1000000000 + end[1]) / 1000 / 1000 / 1000;
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
    get duration(): number {
        if (!this._duration) {
            this.stop();
        }
        return Number.parseFloat(this._duration.toFixed(2));
    }

    /**
     *
     */
    toString() {
        return `${this.duration} sec`;
    }
}
