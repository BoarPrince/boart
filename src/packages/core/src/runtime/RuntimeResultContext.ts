import { RuntimeStatus } from './RuntimeStatus';

/**
 *
 */
export interface RuntimeResultContext {
    startTime?: string;
    endTime?: string;
    duration?: number;
    stackTrace?: string;
    errorMessage?: string;
    status: RuntimeStatus;
}
