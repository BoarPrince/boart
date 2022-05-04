 
import { ExecutionUnit } from '../../common/execution/ExecutionUnit';
import { ParaType } from '../../common/table/ParaType';
import { DataContentHelper } from '../../data/DataContentHelper';
import { DataContext } from '../DataExecutionContext';
import { RowTypeValue } from '../RowTypeValue';

const JSPath = require('jspath');

/**
 * | action          | value |
 * |-----------------|-------|
 * | transform:jpath | xxxx  |
 */
export class TransformJPathExecutionUnit implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    readonly description = 'transform:jpath';
    readonly parameterType = ParaType.False;

    /**
     *
     */
    execute(context: DataContext, row: RowTypeValue<DataContext>): void {
        const rule = row.value.toString();
        const data = JSON.parse(context.execution.data.toJSON()) as object;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const transformedValue = JSPath.apply(rule, data) as ReadonlyArray<object>;
        if (!transformedValue || (Array.isArray(transformedValue) && transformedValue.length === 0)) {
            throw new Error(`cannot evaluate jpath expression, rule: '${rule}', data: ${JSON.stringify(data)}`);
        }

        if (Array.isArray(transformedValue) && transformedValue.length === 1) {
            context.execution.data = DataContentHelper.create(transformedValue[0]);
        } else {
            context.execution.data = DataContentHelper.create(transformedValue);
        }
    }
}
