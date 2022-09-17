import { ExecutionContext } from '@boart/core';
import { DataExecutionContext, DataPreExecutionContext } from '@boart/core-impl';

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
export interface RestAuthorizeDataExecutionContext extends DataExecutionContext {
    token: string;
}

/**
 *
 */
export type RestAuthorizeContext = ExecutionContext<RestAuthorizeConfigContext, DataPreExecutionContext, RestAuthorizeDataExecutionContext>;
