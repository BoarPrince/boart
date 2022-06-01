import { DataContentHelper, ExecutionUnit, ParaType } from '@boart/core';
import JSPath from 'jspath';

import { DataContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';

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
        const data = JSON.parse(context.execution.transformed.toJSON()) as object;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const transformedValue = JSPath.apply(rule, data) as ReadonlyArray<object>;
        if (!transformedValue || (Array.isArray(transformedValue) && transformedValue.length === 0)) {
            throw new Error(`cannot evaluate jpath expression, rule: '${rule}', data: ${JSON.stringify(data)}`);
        }

        if (Array.isArray(transformedValue) && transformedValue.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            context.execution.transformed = DataContentHelper.create(transformedValue[0]);
        } else {
            context.execution.transformed = DataContentHelper.create(transformedValue);
        }
    }
}
