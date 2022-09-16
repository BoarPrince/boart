import { ExecutionContext } from '@boart/core';
import { DataExecutionContext } from '@boart/core-impl';
import { DataPreExecutionContext } from '@boart/core-impl/src/DataExecutionContext';

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
