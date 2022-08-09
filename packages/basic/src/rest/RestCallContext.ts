import { DataContent, ExecutionContext } from '@boart/core';
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
    payload: DataContent | null;
    query: DataContent | null;
    param: DataContent;
    header: DataContent | null;
    formData: DataContent;
    authentication: DataContent | null;
}

/**
 *
 */
export type RestCallContext = ExecutionContext<RestCallConfigContext, RestCallPreExecutionContext, DataExecutionContext>;
