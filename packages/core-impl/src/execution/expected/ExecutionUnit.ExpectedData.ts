import { DataContentHelper, ExecutionUnit, ParaType, SelectorType } from '@boart/core';

import { DataContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';
import { ParaValidator } from '../../validators/ParaValidator';

/**
 * | action            | value |
 * |-------------------|-------|
 * | expected:data     | xxxx  |
 * | expected:data#a.b | xxxx  |
 */
export class ExpectedDataExecutinoUnit implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    readonly description = 'expected:data';
    readonly parameterType = ParaType.False;
    readonly selectorType = SelectorType.Optional;
    readonly validators = [new ParaValidator(['regexp', null])];

    /**
     *
     */

    execute(context: DataContext, row: RowTypeValue<DataContext>): void {
        const expected = row.value.toString();
        const data = !row.selector
            ? context.execution.data.getText()
            : DataContentHelper.getByPath(row.selector, context.execution.data).getText();

        if (expected !== data) {
            throw Error(`${this.description}:
            expected: ${expected}
            actual: ${data}`);
        }
    }
}
