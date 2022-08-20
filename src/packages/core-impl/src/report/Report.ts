import fs from 'fs';

import { EnvLoader, Runtime } from '@boart/core';

import { ReportItem } from './ReportItem';

/**
 *
 */
export class Report {
    /**
     *
     */
    private constructor() {
        // singleton cannot be instantiated from outsinde
    }

    /**
     *
     */
    public static get instance(): Report {
        if (!globalThis._reportInstance) {
            globalThis._reportInstance = new Report();
        }
        return globalThis._reportInstance;
    }

    /**
     *
     */
    /**
     *
     */
    public report(): void {
        const currentRuntime = Runtime.instance.runtime.current;

        // data output
        const objectData: ReportItem = {
            name: EnvLoader.instance.getProjectName(),
            environment: EnvLoader.instance.getEnvironment(),
            startTime: currentRuntime.startTime,
            duration: currentRuntime.duration,
            errorMessage: currentRuntime.errorMessage,
            stackTrace: currentRuntime.stackTrace,
            localItems: currentRuntime.localContext.map((local) => ({
                id: local.id,
                testItems: local.testContext.map((test) => ({
                    id: test.id,
                    stepItems: test.stepContext.map((step) => step.id)
                }))
            }))
        };
        const data: string = JSON.stringify(objectData);

        const filename = EnvLoader.instance.mapReportData(`test-protocol-data.json`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        fs.writeFile(filename, data, 'utf-8', (writeErr) => {
            if (writeErr) return console.error(writeErr);
        });
    }
}
