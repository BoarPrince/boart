import { TicketItem } from './TicketItem';

/**
 *
 */
export interface StatisticValueItem {
    passed: number;
    failed: number;
}

/**
 *
 */
export interface StatisticItem {
    high: StatisticValueItem;
    medium: StatisticValueItem;
    low: StatisticValueItem;
}

/**
 *
 */
export interface OverviewItem {
    topic: string;
    name: string;
    ticket: string;
    tags: string;
    status: string;
    priority: string;
    duration: string;
    startTime: string;
    localId: string;
    testId: string;
}

/**
 *
 */
export interface LocalItem {
    id: string;
    tags: string;
    duration: string;
    status: string;
    name: string;
    number: string;
}

/**
 *
 */
export interface TestItem {
    id: string;
    tags: string;
    name: string;
    status: string;
    duration: string;
    startTime: string;
    priority: string;
    descriptions: string;
    tickets: Array<TicketItem>;
    steps: Array<StepItem>;
}

/**
 *
 */
export interface DataItem {
    id: string;
    desc: string;
    data: string | object;
}

/**
 *
 */
export interface StepItem {
    id: string;
    status: string;
    errorMessage: string;
    duration: string;
    startTime: string;
    type: string;
    description: string;
    input: Array<DataItem>;
    output: Array<DataItem>;
}

/**
 *
 */
export interface ProtocolItem {
    statistic: StatisticItem;
    overview: Array<OverviewItem>;
    locals: Record<string, LocalItem>;
    tests: Record<string, TestItem>;
    projectName: string;
    environment: string;
    durationMin: string;
    startTime: string;
}
