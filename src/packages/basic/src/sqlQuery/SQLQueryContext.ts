import { DefaultExecutionContext, ExecutionContext } from '@boart/core';

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
export type SQLQueryContext = ExecutionContext<SQLQueryConfigContext, SQLQueryPreExecutionContext, DefaultExecutionContext>;
