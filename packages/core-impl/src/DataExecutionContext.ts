import { DataContent, ExecutionContext } from '@boart/core';

/**
 *
 */
export interface DataExecutionContext {
    data: DataContent;
    header: DataContent;
}

/**
 *
 */
export type DataContext = ExecutionContext<object, object, DataExecutionContext>;
