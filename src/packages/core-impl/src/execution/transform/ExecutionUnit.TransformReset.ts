import { ExecutionUnit, ParaType } from '@boart/core';

import { DataContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';

/**
 * | action          | value |
 * |-----------------|-------|
 * | transform:reset |       |
 */
export class TransformResetExecutionUnit implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    readonly description = () => ({
        id: '612c7ecb-3e3c-422a-a881-ce37d576873c',
        title: 'transform:reset',
        description: null,
        examples: null
    });
    readonly parameterType = ParaType.False;

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(context: DataContext, _row: RowTypeValue<DataContext>): void {
        context.execution.transformed = context.execution.data;
    }
}
