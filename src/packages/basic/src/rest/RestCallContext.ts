import { DataContent, ExecutionContext, ObjectContent } from '@boart/core';
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
    param: ObjectContent;
    header: ObjectContent;
    formData: ObjectContent;
    authentication: DataContent | null;
}

/**
 *
 */
export type RestCallContext = ExecutionContext<RestCallConfigContext, RestCallPreExecutionContext, DataExecutionContext>;
