import { ExecutionUnit } from '../../common/execution/ExecutionUnit';
import { ParaType } from '../../common/table/ParaType';
import { DataContentHelper } from '../../data/DataContentHelper';
import { DataContext } from '../DataExecutionContext';
import { RowTypeValue } from '../RowTypeValue';

/**
 * | action                 | value |
 * |------------------------|-------|
 * | expected:header:status | xxxx  |
 */
export class ExpectedHeaderExecutinoUnit implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    readonly description = 'expected:header';
    readonly parameterType = ParaType.True;

    /**
     *
     */
    execute(context: DataContext, row: RowTypeValue<DataContext>): void {
        const expected = row.value.toString();

        if (!row.actionPara) {
            throw Error(`parameter must defined for ${this.description}`);
        }

        const header = DataContentHelper.getByPath(row.actionPara, context.execution.header).getText();
        if (expected !== header) {
            throw Error(`${this.description}: 
            expected: ${expected}
            actual: ${header}`);
        }
    }
}
