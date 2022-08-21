import { RuntimePriority, RuntimeStatus } from '@boart/core';

import { TicketItem } from './TicketItem';

/**
 *
 */
export interface TestReportItem {
    id: string;
    localReportItemId?: string;
    number: string;
    name: string;
    tags: Array<string>;
    errorMessage: string;
    stackTrace: string;
    status: RuntimeStatus;
    priority: RuntimePriority;
    startTime: string;
    duration: string;
    tickets: TicketItem[];
    descriptions: string;
    failureDescription: string;
}
