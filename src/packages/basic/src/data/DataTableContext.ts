import { DefaultExecutionContext, DefaultPreExecutionContext, ExecutionContext, RepeatableExecutionContext } from '@boart/core';

/**
 *
 */
export class RepeatableDataExecutionContext
    implements
        ExecutionContext<object, DefaultPreExecutionContext, DefaultExecutionContext>,
        RepeatableExecutionContext<object, DefaultPreExecutionContext, DefaultExecutionContext>
{
    config: object;
    repetition: { pause: number; count: number };
    preExecution: DefaultPreExecutionContext;
    execution: DefaultExecutionContext;
}
