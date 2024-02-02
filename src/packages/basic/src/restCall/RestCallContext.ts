import { DataContent, DefaultExecutionContext, ExecutionContext, ObjectContent } from '@boart/core';

/**
 *
 */
export interface RestCallConfigContext {
    value: string;
}

/**
 *
 */
export type ContextMethod = {
    url: string;
    type: string;
};

/**
 *
 */
export interface RestCallPreExecutionContext {
    method: ContextMethod;
    payload: DataContent | null;
    query: DataContent | null;
    param: ObjectContent;
    header: ObjectContent;
    formData: ObjectContent;
    authorization: DataContent | null;
}

/**
 *
 */
export type RestCallContext = ExecutionContext<RestCallConfigContext, RestCallPreExecutionContext, DefaultExecutionContext>;
