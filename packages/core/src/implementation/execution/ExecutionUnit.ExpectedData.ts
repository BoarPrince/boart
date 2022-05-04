import { ExecutionUnit } from '../../common/execution/ExecutionUnit';
import { ParaType } from '../../common/table/ParaType';
import { DataContentHelper } from '../../data/DataContentHelper';
import { DataContext } from '../DataExecutionContext';
import { RowTypeValue } from '../RowTypeValue';

/**
 * | action            | value |
 * |-------------------|-------|
 * | expected:data     | xxxx  |
 * | expected:data:a.b | xxxx  |
 */
export class ExpectedDataExecutinoUnit implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    readonly description = 'expected:data';
    readonly parameterType = ParaType.Optional;

    /**
     *
     */

    execute(context: DataContext, row: RowTypeValue<DataContext>): void {
        const expected = row.value.toString();
        const data = !row.actionPara
            ? context.execution.data.getText()
            : DataContentHelper.getByPath(row.actionPara, context.execution.data).getText();

        if (expected !== data) {
            throw Error(`${this.description}: 
            expected: ${expected}
            actual: ${data}`);
        }
    }
}
