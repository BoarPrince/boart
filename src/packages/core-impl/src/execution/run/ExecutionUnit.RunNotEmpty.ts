import { ExecutionUnit, ParaType, Runtime, RuntimeStatus } from '@boart/core';

import { AnyContext } from '../../AnyContext';
import { RowTypeValue } from '../../RowTypeValue';
import { UniqueValidator } from '../../validators/UniqueValidator';

/**
 *
 */
export class RunNotEmptyExecutionUnit implements ExecutionUnit<AnyContext, RowTypeValue<AnyContext>> {
    readonly description = 'run:not-empty';
    readonly parameterType = ParaType.False;
    readonly validators = [new UniqueValidator()];

    /**
     *
     */
    execute(_: AnyContext, row: RowTypeValue<AnyContext>): void {
        const value = row.value.valueOf();

        if (!value) {
            Runtime.instance.stepRuntime.current.status = RuntimeStatus.stopped;
        }
    }
}
