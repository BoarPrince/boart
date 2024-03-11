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
    data: object | string | number | boolean | null;
    header: object | string | number | boolean | null;
    transformed: object | string | number | boolean | null;
}

/**
 *
 */
export type DefaultContext = ExecutionContext<object, DefaultPreExecutionContext, DefaultExecutionContext>;
