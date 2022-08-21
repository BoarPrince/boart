import { RuntimeStatus } from '@boart/core';

/**
 *
 */
export interface StepReportDataItem {
    description: string;
    type: string;
    data: string | object;
}

/**
 *
 */
export interface StepReportItem {
    id: string;
    localReportItemId?: string;
    testReportItemId?: string;
    errorMessage: string;
    stackTrace: string;
    status: RuntimeStatus;
    type: string;
    startTime: string;
    duration: string;
    description: string;
    input: Record<string, StepReportDataItem>;
    result: Record<string, StepReportDataItem>;
}
