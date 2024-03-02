export enum LogEntryType {
    Start = 'start',
    End = 'end'
}

/**
 *
 */
export interface BoartInjectorInstance {
    isRedirecting?: boolean;
    call_level?: number;
    logList?: Array<{ type: LogEntryType; entry: string }>;
}
