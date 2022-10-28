import { ExecutionUnit, ParaType, Runtime, RuntimeStatus } from '@boart/core';

import { AnyContext } from '../../AnyContext';
import { RowTypeValue } from '../../RowTypeValue';
import { UniqueValidator } from '../../validators/UniqueValidator';

/**
 *
 */
export class RunOnlyExecutionUnit implements ExecutionUnit<AnyContext, RowTypeValue<AnyContext>> {
    readonly description = 'run:only';
    readonly parameterType = ParaType.True;
    readonly validators = [new UniqueValidator()];

    /**
     *
     */
    execute(_: AnyContext, row: RowTypeValue<AnyContext>): void {
        const expectedValues = row.value
            .toString()
            .split(/[,;|\s]/)
            .filter((v) => !!v);
        const value = row.actionPara;

        // expected value must be defined error (action), maybe see above.
        if (!expectedValues.includes(value)) {
            Runtime.instance.stepRuntime.current.status = RuntimeStatus.stopped;
        }
    }
}
