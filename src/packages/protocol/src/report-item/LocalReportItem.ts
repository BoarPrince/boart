import { RuntimeStatus } from '@boart/core';

/**
 *
 */
export interface LocalReportItem {
    id: string;
    number: string;
    name: string;
    tags: Array<string>;
    errorMessage: string;
    stackTrace: string;
    status: RuntimeStatus;
    startTime: string;
    duration: number;
}
