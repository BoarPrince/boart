import fs from 'fs';

import { EnvLoader, Runtime } from '@boart/core';

import { StepItem } from './StepItem';

/**
 *
 */
export class StepReport {
    private _type: string;
    private _descriptions = new Array<string>();
    private readonly resultItem = new Map<string, StepItem>();
    private readonly inputItems = new Map<string, StepItem>();

    /**
     *
     */
    private constructor() {
        // it's a singleton
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

        const fromEntries = (map: ReadonlyMap<string, StepItem>): object => {
            const o = {};
            for (const entry of map.entries()) {
                o[entry[0]] = entry[1];
            }
            return o;
        };

        const id = Runtime.instance.stepRuntime.current.id;
        const input = fromEntries(this.inputItems);
        const result = fromEntries(this.resultItem);

        // data output
        const data = JSON.stringify({
            id,
            errorMessage: Runtime.instance.stepRuntime.current.errorMessage,
            stackTrace: Runtime.instance.stepRuntime.current.stackTrace,
            status: Runtime.instance.stepRuntime.current.status,
            type: this._type,
            startTime: Runtime.instance.stepRuntime.current.startTime,
            duration: Runtime.instance.stepRuntime.current.duration,
            description: this._descriptions,
            input,
            result
        });

        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const filename = EnvLoader.instance.mapReportData(`${id}.json`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        fs.writeFile(filename, data, 'utf-8', (writeErr) => {
            if (writeErr) return console.log(writeErr);
        });

        // after reporting the step, reset singleton instance
        delete globalThis._stepReportInstance;
    }

    /**
     *
     */
    public addInputItem(description: string, type: string, data: object | string): void {
        if (this.inputItems.has(description)) {
            throw new Error(`report input type "${description}" already exists`);
        }

        this.inputItems.set(description, {
            description,
            type,
            data
        });
    }

    /**
     *
     */
    public addResultItem(description: string, type: string, data: object | string): void {
        if (this.resultItem.has(description)) {
            throw new Error(`report result type "${description}" already exists`);
        }

        this.resultItem.set(description, {
            description,
            type,
            data
        });
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
