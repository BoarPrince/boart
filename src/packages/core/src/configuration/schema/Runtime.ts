import { ExecutionUnitPlugin } from '../../plugin/ExecutionUnitPlugin';
import { RuntimeStartUp } from './RuntimeStartUp';

/**
 *
 */

export interface Runtime {
    type: string;
    startup: RuntimeStartUp;
    configuration: Record<string, unknown> | (() => ExecutionUnitPlugin);
}
