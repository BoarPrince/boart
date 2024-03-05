import { RuntimeStatus } from '../../runtime/RuntimeStatus';

/**
 *
 */
export interface LocalReportItem {
    id: string;
    number: string;
    name: string;
    tags: Array<string>;
    errorMessage: string;
    stackTrace: string;
    status: RuntimeStatus;
    startTime: string;
    duration: number;
}
