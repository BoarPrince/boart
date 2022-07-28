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
export interface RestCallPreExecutionContext {
    url: string;
    method: string;
    payload: string;
    query: string;
    param: Record<string, string>;
    header: Record<string, string>;
    formData: Record<string, string>;
    authentication: string;
}

/**
 *
 */
export type RestCallContext = ExecutionContext<RestCallConfigContext, RestCallPreExecutionContext, DataExecutionContext>;
