import fs from 'fs';

import { EnvLoader, Timer } from '@boart/core';
import { v1 as uuidv1 } from 'uuid';

import { StepItems } from './StepItems';

/**
 *
 */
export class StepReport {
    private _id = uuidv1();
    private _type: string;
    private _timer: Timer;
    private _descriptions = new Array<string>();
    private readonly resultItems = new Map<string, StepItems>();
    private readonly inputItems = new Map<string, StepItems>();

    /**
     *
     */
    private constructor() {
        this._timer = new Timer();
    }

    /**
     *
     */
    public static get instance(): StepReport {
        if (!globalThis._stepReportInstance) {
            globalThis._stepReportInstance = new StepReport();
        }
        return globalThis._stepReportInstance;
    }

    /**
     *
     */
    public report(): void {
        if (this._descriptions.length == 0) {
            // do nothing, if no description is defined
            return;
        }

        const fromEntries = (map: ReadonlyMap<string, StepItems>): object => {
            const o = {};
            for (const entry of map.entries()) {
                o[entry[0]] = entry[1];
            }
            return o;
        };

        // data output
        const data = JSON.stringify({
            id: this._id,
            type: this._type,
            startTime: this._timer,
            description: this._descriptions,
            input: fromEntries(this.inputItems),
            result: fromEntries(this.resultItems)
        });

        const filename = EnvLoader.instance.mapReportData(`${this._id}.json`);
        console.message(`##report##${JSON.stringify({ id: this._id, filename })}`);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        fs.writeFile(EnvLoader.instance.mapReportData(`${this._id}.json`), data, 'utf-8', (writeErr) => {
            if (writeErr) return console.log(writeErr);
        });

        // after reporting the step, reset singleton instance
        delete globalThis._stepReportInstance;
    }

    /**
     *
     */
    public getInputItems(type: string): StepItems {
        if (!this.inputItems.has(type)) {
            this.inputItems.set(type, new StepItems(type));
        }
        return this.inputItems.get(type);
    }

    /**
     *
     */
    public getResultItems(type: string): StepItems {
        if (!this.resultItems.has(type)) {
            this.resultItems.set(type, new StepItems(type));
        }
        return this.resultItems.get(type);
    }

    /**
     *
     */
    public addDescription(value: string): void {
        this._descriptions.push(value);
    }

    /**
     *
     */
    public get description(): string {
        return this._descriptions.join('\n');
    }

    /**
     *
     */
    public set type(type: string) {
        this._type = type;
    }
}
