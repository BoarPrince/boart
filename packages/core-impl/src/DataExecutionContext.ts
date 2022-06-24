import { DataContent, ExecutionContext } from '@boart/core';

/**
 *
 */
export interface DataExecutionContext {
    data: DataContent | null;
    header: DataContent | null;
    transformed: DataContent | null;
}

/**
 *
 */
export type DataContext = ExecutionContext<object, object, DataExecutionContext>;
