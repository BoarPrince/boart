import { DefaultRowType, ExecutionUnit, ParaType, Runtime, RuntimeStatus } from '@boart/core';

import { AnyContext } from '../../AnyContext';
import { UniqueValidator } from '../../validators/UniqueValidator';

/**
 *
 */
export class RunNotEmptyExecutionUnit implements ExecutionUnit<AnyContext, DefaultRowType<AnyContext>> {
    readonly key = Symbol('run:not-empty');
    readonly description = () => ({
        id: '3deeb49b-c26c-4503-927e-d3486fd47fbc',
        description: null,
        examples: null
    });
    readonly parameterType = ParaType.False;
    readonly validators = [new UniqueValidator()];

    /**
     *
     */
    execute(_: AnyContext, row: DefaultRowType<AnyContext>): void {
        const value = row.value?.valueOf();

        if (!value) {
            Runtime.instance.stepRuntime.currentContext.status = RuntimeStatus.stopped;
        }
    }
}
