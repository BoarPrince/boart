import { TicketItem } from '../report-item/TicketItem';

import { StepItem } from './StepItem';

/**
 *
 */

export interface TestItem {
    id: string;
    tags: Array<string>;
    name: string;
    status: string;
    duration: string;
    startTime: string;
    priority: string;
    descriptions: string;
    tickets: Array<TicketItem>;
    steps: Array<StepItem>;
}
