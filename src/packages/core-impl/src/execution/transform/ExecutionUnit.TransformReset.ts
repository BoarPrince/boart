import { DefaultContext, DefaultRowType, ExecutionUnit, ParaType } from '@boart/core';

/**
 * | action          | value |
 * |-----------------|-------|
 * | transform:reset |       |
 */
export class TransformResetExecutionUnit implements ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>> {
    readonly key = Symbol('transform:reset');
    readonly description = () => ({
        id: '612c7ecb-3e3c-422a-a881-ce37d576873c',
        description: null,
        examples: null
    });
    readonly parameterType = ParaType.False;

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(context: DefaultContext, _row: DefaultRowType<DefaultContext>): void {
        context.execution.transformed = context.execution.data;
    }
}
