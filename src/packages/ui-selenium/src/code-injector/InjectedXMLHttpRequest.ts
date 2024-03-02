import { LogEntry } from './LogEntry';

/**
 *
 */
export interface InjectedXMLHttpRequest extends XMLHttpRequest {
    logEntry: LogEntry;
}
