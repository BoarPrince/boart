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
        this.startTimeISO = new Date(this.start[0] * 1000 + this.start[1] / 1000000).toISOString();
    }

    /**
     *
     */
    stop() {
        const duration = process.hrtime(this.start);
        this._duration = duration[0] + duration[1] / 1000000;

        const end = process.hrtime();
        this.endTimeISO = new Date(end[0] * 1000 + end[1] / 1000000).toISOString();
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
        return this.endTimeISO;
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
