import { ExecutionUnitPlugin } from './ExecutionUnitPlugin';

/**
 *
 */

export interface ExecutionUnitPluginSetter {
    addExecutionUnit(clientExecutionProxy: ExecutionUnitPlugin): void;
}
