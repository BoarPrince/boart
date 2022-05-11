import { DataContent, ExecutionContext } from '@boart/core';

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
interface RestCallExecutionContext {
    data: DataContent;
    header: DataContent;
}

/**
 *
 */
export type RestCallContext = ExecutionContext<RestCallConfigContext, RestCallPreExecutionContext, RestCallExecutionContext>;
