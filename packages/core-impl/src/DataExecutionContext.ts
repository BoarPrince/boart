import { DataContent, ExecutionContext } from '@boart/core';

/**
 *
 */
export interface DataExecutionContext {
    data: DataContent;
    header: DataContent;
    transformed: DataContent;
}

/**
 *
 */
export type DataContext = ExecutionContext<object, object, DataExecutionContext>;
