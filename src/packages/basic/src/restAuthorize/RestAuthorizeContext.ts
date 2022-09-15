import { ExecutionContext } from '@boart/core';
import { DataExecutionContext } from 'core-impl/dist';

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
    tokenDecoded: string;
}

/**
 *
 */
export type RestAuthorizeContext = ExecutionContext<RestAuthorizeConfigContext, object, RestAuthorizeDataExecutionContext>;
