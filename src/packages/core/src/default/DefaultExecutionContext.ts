import { ExecutionContext } from '../execution/ExecutionContext';

/**
 *
 */
export interface DefaultPreExecutionContext {
    payload: object | null;
}

/**
 *
 */
export interface DefaultExecutionContext {
    data: object | null;
    header: object | null;
    transformed: object | null;
}

/**
 *
 */
export type DefaultContext = ExecutionContext<object, DefaultPreExecutionContext, DefaultExecutionContext>;
