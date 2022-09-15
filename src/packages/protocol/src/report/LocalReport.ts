import fs from 'fs';

import { EnvLoader, Runtime } from '@boart/core';

import { LocalReportItem } from '../report-item/LocalReportItem';

/**
 *
 */
export class LocalReport {
    /**
     *
     */
    private constructor() {
        // singleton cannot be instantiated from outside
    }

    /**
     *
     */
    public static get instance(): LocalReport {
        if (!globalThis._localReportInstance) {
            globalThis._localReportInstance = new LocalReport();
        }
        return globalThis._localReportInstance;
    }

    /**
     *
     */
    private getNumber(location: string, name: string): string {
        const numberRegexp = /^([\d]+[\d.]*)/;
        const nameMatch = name.match(numberRegexp);
        const nameNumber = !nameMatch ? '' : nameMatch[1].replace(/[.]$/, '');
        const locationMatch = location.match(/^([\d])/);
        if (!!locationMatch) {
            const locationNumber = locationMatch[1].replace(/[.]$/, '');
            return nameNumber.replace(numberRegexp, locationNumber) || locationNumber;
        }
        return nameNumber;
    }
    /**
     *
     */
    private getName(name: string): string {
        return name.replace(/\d[\d.]+\W*/, '');
    }

    /**
     *
     */
    public report(): void {
        // after reporting the local, reset singleton instance
        globalThis._localReportInstance = null;

        const currentLocalRuntime = Runtime.instance.localRuntime.current;
        const id = currentLocalRuntime.id;

        // data output
        const objectData: LocalReportItem = {
            id,
            number: this.getNumber(currentLocalRuntime.location, currentLocalRuntime.name),
            name: this.getName(currentLocalRuntime.name),
            tags: currentLocalRuntime.tags,
            errorMessage: currentLocalRuntime.errorMessage,
            stackTrace: currentLocalRuntime.stackTrace,
            status: currentLocalRuntime.status,
            startTime: currentLocalRuntime.startTime,
            duration: currentLocalRuntime.duration
        };
        const data: string = JSON.stringify(objectData);

        const filename = EnvLoader.instance.mapReportData(`${id}.json`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        fs.writeFile(filename, data, 'utf-8', (writeErr) => {
            if (writeErr) return console.error(writeErr);
        });
    }
}
