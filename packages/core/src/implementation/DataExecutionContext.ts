import { ExecutionContext } from '../common/execution/ExecutionContext';
import { DataContent } from '../data/DataContent';

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
export interface PreExecutionContext {}

/**
 *
 */
export interface ConfigContext {}

/**
 *
 */
export type DataContext = ExecutionContext<ConfigContext, PreExecutionContext, DataExecutionContext>;
