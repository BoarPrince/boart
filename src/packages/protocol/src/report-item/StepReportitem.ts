import { RuntimeStatus } from '@boart/core';

import { StepReportDataItem } from './StepReportDataItem';

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
