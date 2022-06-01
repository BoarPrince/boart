import { DataContentHelper, ExecutionUnit, ParaType } from '@boart/core';

import { DataContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';
import { JsonLogic } from '../../jsonlogic/JsonLogic';

/**
 * | action               | value |
 * |----------------------|-------|
 * | transform:jsonLogic  | xxxx  |
 */
export class TransformJsonLogicExecutionUnit implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    readonly description = 'transform:jsonLogic';
    readonly parameterType = ParaType.False;

    /**
     *
     */
    execute(context: DataContext, row: RowTypeValue<DataContext>): void {
        const rule = row.value.toString();
        const data = context.execution.transformed.getText();

        context.execution.transformed = DataContentHelper.create(JsonLogic.instance.transform(rule, data));
    }
}
