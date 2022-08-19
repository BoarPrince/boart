import { ExecutionUnit, ParaType } from '@boart/core';

import { DataContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';

/**
 * | action          | value |
 * |-----------------|-------|
 * | transform:reset |       |
 */
export class TransformResetExecutionUnit implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    readonly description = 'transform:reset';
    readonly parameterType = ParaType.False;

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(context: DataContext, _row: RowTypeValue<DataContext>): void {
        context.execution.transformed = context.execution.data;
    }
}