import { ExecutionUnit, ParaType } from '@boart/core';

import { AnyContext } from '../../AnyContext';
import { RowTypeValue } from '../../RowTypeValue';
import { StepReport } from '../../report/StepReport';
import { UniqueValidator } from '../../validators/UniqueValidator';

/**
 * |action       |value           |
 * |-------------|----------------|
 * | description | this is a test |
 */
export class DescriptionExecutionUnit implements ExecutionUnit<AnyContext, RowTypeValue<AnyContext>> {
    readonly description = 'description';
    readonly parameterType = ParaType.False;
    readonly validators = [new UniqueValidator()];

    /**
     *
     */
    execute(_: AnyContext, row: RowTypeValue<AnyContext>): void {
        StepReport.instance.addDescription(row.value.toString());
    }
}
