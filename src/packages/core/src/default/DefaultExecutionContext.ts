import { DataContent } from '../data/DataContent';
import { ExecutionContext } from '../execution/ExecutionContext';

/**
 *
 */
export interface DefaultPreExecutionContext {
    payload: DataContent | null;
}

/**
 *
 */
export interface DefaultExecutionContext {
    data: DataContent | null;
    header: DataContent | null;
    transformed: DataContent | null;
}

/**
 *
 */
export type DefaultContext = ExecutionContext<object, DefaultPreExecutionContext, DefaultExecutionContext>;
