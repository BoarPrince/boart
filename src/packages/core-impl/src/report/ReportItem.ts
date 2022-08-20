/**
 *
 */
interface TestItem {
    id: string;
    stepItems: Array<string>;
}

/**
 *
 */
interface LocalItem {
    id: string;
    testItems: Array<TestItem>;
}

/**
 *
 */
export interface ReportItem {
    name: string;
    environment: string;
    startTime: string;
    errorMessage: string;
    stackTrace: string;
    duration: string;
    localItems: Array<LocalItem>;
}
