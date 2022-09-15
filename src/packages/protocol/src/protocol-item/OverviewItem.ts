/**
 *
 */

export interface OverviewItem {
    topic: string;
    name: string;
    ticket: string;
    tags: Array<string>;
    status: string;
    priority: string;
    duration: number;
    startTime: string;
    localId: string;
    testId: string;
}
