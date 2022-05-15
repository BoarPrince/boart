import { DataContentHelper, ExecutionUnit, ParaType, SelectorType } from '@boart/core';

import { DataContext } from '../DataExecutionContext';
import { RowTypeValue } from '../RowTypeValue';

/**
 * | action                 | value |
 * |------------------------|-------|
 * | expected:header:status | xxxx  |
 */
export class ExpectedHeaderExecutinoUnit implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    readonly description = 'expected:header';
    readonly parameterType = ParaType.False;
    readonly selectorType = SelectorType.True;

    /**
     *
     */
    execute(context: DataContext, row: RowTypeValue<DataContext>): void {
        const expected = row.value.toString();

        const header = DataContentHelper.getByPath(row.selector, context.execution.header).getText();
        if (expected !== header) {
            throw Error(`${this.description}: 
            expected: ${expected}
            actual: ${header}`);
        }
    }
}
