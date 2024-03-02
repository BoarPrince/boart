/**
 *
 */
export interface LogEntry {
    url: string;
    id: string;
    method: string;
    startTime: number;
    endTime: number;
    status: number;
    duration: string;
    path: string;
    traceId: string;
    requestBody: object | string;
    response: object | string;
    responseType: string;
    headers: string[];
}
