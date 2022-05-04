import { ExecutionUnit } from '../../common/execution/ExecutionUnit';
import { JsonLogic } from '../../common/jsonlogic/JsonLogic';
import { ParaType } from '../../common/table/ParaType';
import { ParaValidator } from '../../common/table/Validators/ParaValidator';
import { DataContext } from '../DataExecutionContext';
import { RowTypeValue } from '../RowTypeValue';

/**
 * | action                   | value |
 * |--------------------------|-------|
 * | expected:jsonLogic:true  | xxxx  |
 * | expected:jsonLogic:false | xxxx  |
 */
export class ExpectedJsonLogicExecutionUnit implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    readonly description = 'expected:jsonLogic';
    readonly parameterType = ParaType.True;
    readonly validators = [new ParaValidator(['true', 'false'])];

    /**
     *
     */
    execute(context: DataContext, row: RowTypeValue<DataContext>): void {
        const rule = row.value.toString();
        const data = context.execution.data.getText();

        if (row.actionPara === 'true') {
            JsonLogic.instance.checkTruthy(rule, data);
        } else {
            JsonLogic.instance.checkFalsy(rule, data);
        }
    }
}
