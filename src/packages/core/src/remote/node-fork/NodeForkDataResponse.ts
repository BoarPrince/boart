import { RemoteReportItem } from '../RemoteReportItem';

/**
 *
 */
export interface RemoteResponse {
    execution: {
        data: unknown;
        header: unknown;
    };
    reportItems: Array<RemoteReportItem>;
}
