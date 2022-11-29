import { ExecutionUnit, ParaType, Runtime } from '@boart/core';

import { AnyContext } from '../../AnyContext';
import { RowTypeValue } from '../../RowTypeValue';
import { UniqueValidator } from '../../validators/UniqueValidator';

/**
 * |action       |value           |
 * |-------------|----------------|
 * | description | this is a test |
 */
export class DescriptionExecutionUnit implements ExecutionUnit<AnyContext, RowTypeValue<AnyContext>> {
    readonly description = {
        id: 'b89ed4c8-56b6-4b05-98b5-e637a3129d22',
        title: 'description',
        description: null,
        examples: null
    };
    readonly priority = 100;
    readonly parameterType = ParaType.False;
    readonly validators = [new UniqueValidator()];

    /**
     *
     */
    execute(_: AnyContext, row: RowTypeValue<AnyContext>): void {
        Runtime.instance.stepRuntime.current.descriptions.push(row.value.toString());
    }
}
