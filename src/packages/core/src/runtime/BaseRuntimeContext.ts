import { RuntimeStatus } from './RuntimeStatus';

/**
 *
 */

export abstract class BaseRuntimeContext {
    id: string;
    name: string;
    startTime?: string;
    endTime?: string;
    duration?: number;
    location?: string;
    tags?: Array<string>;
    status = RuntimeStatus.notExecuted;
    stackTrace?: string;
    errorMessage?: string;
}
