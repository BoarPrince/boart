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
type ReadOnly<T> = { readonly [key in keyof T]: ReadOnly<T[key]> };

/**
 *
 */
export type DefaultContext = ExecutionContext<object, DefaultPreExecutionContext, DefaultExecutionContext>;

/**
 *
 */
export type ReadonlyDefaultContext = ReadOnly<DefaultContext>;
