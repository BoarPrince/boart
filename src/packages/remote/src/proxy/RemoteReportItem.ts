/**
 *
 */
export interface RemoteReportItem {
    description: string;
    dataType: 'json' | 'text';
    type: 'payload' | 'header' | 'input' | 'unknown';
    data: number | boolean | string | Array<number | boolean | string>;
}
