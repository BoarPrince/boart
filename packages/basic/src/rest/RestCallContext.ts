import { ExecutionContext } from '@boart/core';
import { DataExecutionContext } from '@boart/core-impl';

/**
 *
 */
export interface RestCallConfigContext {
    value: string;
}

/**
 *
 */
interface RestCallPreExecutionContext {
    payload: string;
    method: string;
    query: string;
    url: string;
}

/**
 *
 */
export type RestCallContext = ExecutionContext<RestCallConfigContext, RestCallPreExecutionContext, DataExecutionContext>;
