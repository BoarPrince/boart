import fs from 'fs';

import { ContentType, EnvLoader, Runtime } from '@boart/core';

import { StepReportData } from '../report-item/StepReportData';
import { StepReportDataItem } from '../report-item/StepReportDataItem';
import { StepReportItem } from '../report-item/StepReportitem';

/**
 *
 */
class DataDelegate {
    /**
     *
     */
    constructor(private instance: StepReport) {}

    /**
     * Add input data element to the protocol view
     *
     * @param description The description is shown as header in the protocol
     * @param data        Below the header the data is shown
     */
    addInput(description: string, data: object | string): this {
        this.instance.addInputItem(description, 'object', data);
        return this;
    }

    /**
     * Add response data element to the protocol view
     *
     * @param description The description is shown as header in the protocol
     * @param data        Below the header the data is shown
     */
    addResult(description: string, data: object | string): this {
        this.instance.addInputItem(description, 'object', data);
        return this;
    }
}

/**
 *
 */
export class StepReport {
    private _type: string;
    private readonly resultItem = new Map<string, StepReportDataItem>();
    private readonly inputItems = new Map<string, StepReportDataItem>();
    private readonly linkItems = new Array<[string, string]>();

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
    public clear(): void {
        globalThis._stepReportInstance = undefined;
    }

    /**
     *
     */
    public report(): void {
        // after reporting the step, reset singleton instance
        globalThis._stepReportInstance = undefined;
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
            group: currentStepRuntime.group,
            description: currentStepRuntime.descriptions.join('\n'),
            input: fromEntries(this.inputItems),
            result: fromEntries(this.resultItem),
            links: this.linkItems
        };
        const data = JSON.stringify(objectData);

        const filename = EnvLoader.instance.mapReportData(`${id}.json`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        fs.writeFile(filename, data, 'utf-8', (writeErr) => {
            if (writeErr) return console.log(writeErr);
        });
    }

    /**
     * Each test step can be present in the protocol view. Therefore it is needed to define
     * a description which is shown in the protocol for the step.
     *
     * @param description It's the header element of the presented test protocol item.
     * @param group       The group can group similar test protocol items as child items.
     *                    A group is defined, if more than one item has the same group.
     */
    public static report(description: string, group?: string): DataDelegate {
        Runtime.instance.stepRuntime.current.descriptions.push(description);
        if (!!group) {
            Runtime.instance.stepRuntime.current.group = group;
        }
        return new DataDelegate(StepReport.instance);
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
            data: StepReport.tryConvertToObject(data?.valueOf())
        });
    }

    /**
     *
     */
    public addResultItem(description: string, type: string, data: object | number | boolean | string): void {
        if (!data) {
            return;
        }

        if (this.resultItem.has(description)) {
            throw new Error(`report result type "${description}" already exists`);
        }

        this.resultItem.set(description, {
            description,
            type,
            data: StepReport.tryConvertToObject(data?.valueOf())
        });
    }

    /**
     *
     */
    public getResultData(description: string, type: string): StepReportData {
        if (!this.resultItem.has(description)) {
            this.resultItem.set(description, {
                description,
                type,
                data: []
            });
        }

        const dataItems = this.resultItem.get(description).data as Array<string | object>;
        return {
            add: (data: string | object) => {
                dataItems.push(data);
            }
        };
    }

    /**
     *
     */
    public addLink(name: string, link: string) {
        this.linkItems.push([name, link]);
    }

    /**
     *
     */
    public set type(type: string) {
        this._type = type;
    }

    /**
     *
     */
    private static tryConvertToObject(data): string | object {
        if (typeof data === 'string') {
            try {
                return JSON.parse(data);
            } catch (error) {
                // use data without parsing
            }
        } else if (Array.isArray(data)) {
            return data;
        } else if (typeof data === 'object') {
            const dataAsJSON = JSON.stringify(data, (key: string, value: ContentType) => {
                if (typeof value === 'string') {
                    // occurs when a DataContentObject is inside an object
                    return this.tryConvertToObject(value);
                } else {
                    return value;
                }
            });
            return JSON.parse(dataAsJSON);
        }

        return data;
    }
}
