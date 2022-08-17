import fs from 'fs';

import { EnvLoader, Timer } from '@boart/core';
import { v1 as uuidv1 } from 'uuid';

/**
 *
 */
export class StepReport {
    private _id = uuidv1();
    private _type: string;
    private _timer: Timer;
    private _descriptions = new Array<string>();
    private _result = new Map<string, string | ReadonlyArray<object>>();
    private _input = new Map<string, string | ReadonlyArray<object>>();

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

        const fromEntries = (map: ReadonlyMap<string, string | ReadonlyArray<object>>): object => {
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
            input: fromEntries(this._input),
            result: fromEntries(this._result)
        });

        const filename = EnvLoader.instance.mapReportData(`${this._id}.json`);
        console.message(`##report##${JSON.stringify({ id: this._id, filename })}`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        fs.writeFile(EnvLoader.instance.mapReportData(`${this._id}.json`), data, 'utf-8', (writeErr) => {
            if (writeErr) return console.log(writeErr);
        });
    }

    /**
     *
     */
    public addInput(key: string, value: string | ReadonlyArray<any>): void {
        if (!value) {
            return;
        }

        if (Array.isArray(value) && value.length === 0) {
            return;
        }

        if (this._input.has(key)) {
            this._input.delete(key);
        }

        this._input.set(key, value);
    }

    /**
     *
     */
    public addInputDetail(key: string, value: any): void {
        if (!this._input.has(key)) {
            this._input.set(key, []);
        }
        const dataContainer = this._input.get(key);
        if (!Array.isArray(dataContainer)) {
            console.error(`Devcontainer of ${key}, must be a array`);
        } else {
            dataContainer.push(value);
        }
    }

    /**
     *
     */
    public getLastInputDetail(key: string): any {
        if (!this._input.has(key)) {
            return {};
        }
        const dataContainer = this._input.get(key);
        return dataContainer[dataContainer.length - 1];
    }

    /**
     *
     */
    public addInputData(value: string | ReadonlyArray<string>): void {
        this.addInput('data', value);
    }

    /**
     *
     */
    public addInputDataDetail(value: string | ReadonlyArray<string>): void {
        this.addInputDetail('data', value);
    }

    /**
     *
     */
    public setInputDesc(description: string): void {
        this.addInput('desc', description);
    }

    /**
     *
     */
    public setResultDesc(description: string): void {
        this.addResult('desc', description);
    }

    /**
     *
     */
    public addResult(key: string, value: string): void {
        if (!value) {
            return;
        }

        if (this._result.has(key)) {
            this._result.delete(key);
        }

        this._result.set(key, value);
    }

    /**
     *
     */
    public addResultDetail(key: string, value: any): void {
        if (!this._result.has(key)) {
            this._result.set(key, []);
        }
        const dataContainer = this._result.get(key);
        if (!Array.isArray(dataContainer)) {
            console.error(`Devcontainer of ${key}, must be a array`);
        } else {
            dataContainer.push(value);
        }
    }

    /**
     *
     */
    public addResultData(value: string): void {
        this.addResult('data', value);
    }

    /**
     *
     */
    public addResultDataDetail(value: string): void {
        this.addResultDetail('data', value);
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
    public setType(type: string) {
        this._type = type;
    }
}
