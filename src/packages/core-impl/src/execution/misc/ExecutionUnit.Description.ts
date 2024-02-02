import { DefaultRowType, ExecutionUnit, ParaType, Runtime } from '@boart/core';
import { first } from 'rxjs/operators';

import { AnyContext } from '../../AnyContext';
import { UniqueValidator } from '../../validators/UniqueValidator';

/**
 * |action       |value           |
 * |-------------|----------------|
 * | description | this is a test |
 */
export class DescriptionExecutionUnit implements ExecutionUnit<AnyContext, DefaultRowType<AnyContext>> {
    readonly key = Symbol('description');
    readonly description = () => ({
        id: 'description:unit',
        description: null,
        examples: null
    });
    readonly priority = 100;
    readonly parameterType = ParaType.False;
    readonly validators = [new UniqueValidator()];

    /**
     *
     */
    execute(_: AnyContext, row: DefaultRowType<AnyContext>): void {
        Runtime.instance.stepRuntime
            .onClear()
            .pipe(first())
            .subscribe(() => {
                Runtime.instance.stepRuntime.currentContext.descriptions = [];
            });

        Runtime.instance.stepRuntime.currentContext.descriptions.push(row.value.toString());
    }
}
