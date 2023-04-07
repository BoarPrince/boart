import { ExecutionContext, RepeatableExecutionContext } from '@boart/core';
import { DataExecutionContext, DataPreExecutionContext } from '@boart/core-impl';

/**
 *
 */
export class RepeatableDataExecutionContext
    implements
        ExecutionContext<object, DataPreExecutionContext, DataExecutionContext>,
        RepeatableExecutionContext<object, DataPreExecutionContext, DataExecutionContext>
{
    config: object;
    repetition: { pause: number; count: number };
    preExecution: DataPreExecutionContext;
    execution: DataExecutionContext;
}
