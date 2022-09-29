import { ExecutionContext } from './ExecutionContext';

/**
 *
 */
export interface ExecutionUnitValidation<TExecutionContext extends ExecutionContext<object, object, object>> {
    /**
     *
     */
    validate(context: TExecutionContext): void | Promise<void>;
}
