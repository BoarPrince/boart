import { DefaultRowType, ExecutionUnit, ParaType, Runtime } from '@boart/core';

import { AnyContext } from '../../AnyContext';
import { UniqueValidator } from '../../validators/UniqueValidator';

/**
 *
 */
export class GroupExecutionUnit implements ExecutionUnit<AnyContext, DefaultRowType<AnyContext>> {
    readonly key = Symbol('group');
    readonly description = () => ({
        id: '31f46a7e-8cc0-4ebf-ae63-a9d30a2cafb4',
        description: null,
        examples: null
    });
    readonly parameterType = ParaType.False;
    readonly validators = [new UniqueValidator()];

    /**
     *
     */
    execute(_: AnyContext, row: DefaultRowType<AnyContext>): void {
        Runtime.instance.stepRuntime.currentContext.group = row.value.toString();
    }
}
