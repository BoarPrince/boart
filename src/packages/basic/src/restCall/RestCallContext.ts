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
export type RestCallContext = ExecutionContext<RestCallConfigContext, RestCallPreExecutionContext, DataExecutionContext>;
