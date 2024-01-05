import { ExecutionUnit, ParaType, Runtime, RuntimeStatus } from '@boart/core';

import { AnyContext } from '../../AnyContext';
import { RowTypeValue } from '../../RowTypeValue';
import { UniqueValidator } from '../../validators/UniqueValidator';

/**
 *
 */
export class RunNotEmptyExecutionUnit implements ExecutionUnit<AnyContext, RowTypeValue<AnyContext>> {
    readonly description = () => ({
        id: '3deeb49b-c26c-4503-927e-d3486fd47fbc',
        title: 'run:not-empty',
        description: null,
        examples: null
    });
    readonly parameterType = ParaType.False;
    readonly validators = [new UniqueValidator()];

    /**
     *
     */
    execute(_: AnyContext, row: RowTypeValue<AnyContext>): void {
        const value = row.value?.valueOf();

        if (!value) {
            Runtime.instance.stepRuntime.currentContext.status = RuntimeStatus.stopped;
        }
    }
}
