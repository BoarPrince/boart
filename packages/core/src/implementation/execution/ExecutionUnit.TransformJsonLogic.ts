import { ExecutionUnit } from '../../common/execution/ExecutionUnit';
import { JsonLogic } from '../../common/jsonlogic/JsonLogic';
import { ParaType } from '../../common/table/ParaType';
import { DataContentHelper } from '../../data/DataContentHelper';
import { DataContext } from '../DataExecutionContext';
import { RowTypeValue } from '../RowTypeValue';

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
        const data = context.execution.data.getText();

        context.execution.data = DataContentHelper.create(JsonLogic.instance.transform(rule, data));
    }
}
