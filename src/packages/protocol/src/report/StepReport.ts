import fs from 'fs';

import { EnvLoader, Runtime } from '@boart/core';

import { StepReportDataItem } from '../report-item/StepReportDataItem';
import { StepReportItem } from '../report-item/StepReportitem';

/**
 *
 */
export class StepReport {
    private _type: string;
    private readonly resultItem = new Map<string, StepReportDataItem>();
    private readonly inputItems = new Map<string, StepReportDataItem>();

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
        // after reporting the step, reset singleton instance
        globalThis._stepReportInstance = null;
        const currentStepRuntime = Runtime.instance.stepRuntime.current;

        if (currentStepRuntime.descriptions?.length === 0) {
            // do nothing, if no description is defined
            return;
        }

        const fromEntries = (map: ReadonlyMap<string, StepReportDataItem>): Record<string, StepReportDataItem> => {
            const o: Record<string, StepReportDataItem> = {};
            for (const entry of map.entries()) {
                o[entry[0]] = entry[1];
            }
            return o;
        };

        const id = currentStepRuntime.id;

        // data output
        const objectData: StepReportItem = {
            id,
            errorMessage: currentStepRuntime.errorMessage,
            stackTrace: currentStepRuntime.stackTrace,
            status: currentStepRuntime.status,
            type: this._type,
            startTime: currentStepRuntime.startTime,
            duration: currentStepRuntime.duration,
            description: currentStepRuntime.descriptions.join('\n'),
            input: fromEntries(this.inputItems),
            result: fromEntries(this.resultItem)
        };
        const data = JSON.stringify(objectData);

        const filename = EnvLoader.instance.mapReportData(`${id}.json`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        fs.writeFile(filename, data, 'utf-8', (writeErr) => {
            if (writeErr) return console.log(writeErr);
        });
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
            data: data.valueOf()
        });
    }

    /**
     *
     */
    public set type(type: string) {
        this._type = type;
    }
}
