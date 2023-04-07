import { ExecutionContext } from './ExecutionContext';

/**
 *
 */
export interface RepeatableExecutionContext<TConfig, TPreExecution, TExecution>
    extends ExecutionContext<TConfig, TPreExecution, TExecution> {
    readonly repetition: {
        pause: number;
        count: number;
    };
}
