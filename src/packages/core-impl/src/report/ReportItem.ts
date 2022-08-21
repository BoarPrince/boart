/**
 *
 */
export interface ReportItemTest {
    id: string;
    stepItems: Array<string>;
}

/**
 *
 */
export interface ReportItemLocal {
    id: string;
    testItems: Array<ReportItemTest>;
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
    localItems: Array<ReportItemLocal>;
}
