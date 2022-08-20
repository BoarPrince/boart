import { RuntimeStatus } from '@boart/core';

/**
 *
 */
export interface StepReportitem {
    id: string;
    errorMessage: string;
    stackTrace: string;
    status: RuntimeStatus;
    type: string;
    startTime: string;
    duration: string;
    description: string;
    input: Record<string, object | string>;
    result: Record<string, object | string>;
}
