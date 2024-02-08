import { DataContent, DefaultExecutionContext, DefaultPreExecutionContext, ExecutionContext } from '@boart/core';

/**
 *
 */
export interface RestAuthorizeConfigContext {
    url: string;
    grantType: string;
    retryCount: number;
    retryPause: number;
    clientId: string;
    clientSecret: string;
    scope: string;
    username: string;
    password: string;
}

/**
 *
 */
export interface RestAuthorizeDataExecutionContext extends DefaultExecutionContext {
    token: string;
    data: DataContent | null;
    header: DataContent | null;
    transformed: DataContent | null;
}

/**
 *
 */
export type RestAuthorizeContext = ExecutionContext<
    RestAuthorizeConfigContext,
    DefaultPreExecutionContext,
    RestAuthorizeDataExecutionContext
>;
