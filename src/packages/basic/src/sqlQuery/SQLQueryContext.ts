import { ExecutionContext } from '@boart/core';
import { DataExecutionContext } from '@boart/core-impl';

/**
 *
 */
export interface SQLQueryConfigContext {
    type: string;
    username: string;
    password: string;
    hostname: string;
}

/**
 *
 */
export interface SQLQueryPreExecutionContext {
    database: string;
    query: string;
}

/**
 *
 */
export type SQLQueryContext = ExecutionContext<SQLQueryConfigContext, SQLQueryPreExecutionContext, DataExecutionContext>;
