import { RuntimeStatus } from '@boart/core';

import { TicketItem } from './TicketItem';

/**
 *
 */
export interface TestReportItem {
    id: string;
    number: string;
    name: string;
    tags: Array<string>;
    errorMessage: string;
    stackTrace: string;
    status: RuntimeStatus;
    priority: string;
    startTime: string;
    duration: string;
    tickets: TicketItem[];
    descriptions: string;
    failureDescription: string;
}
