import { DataContent, DataContentHelper, ExecutionUnit, ParaType, SelectorType } from '@boart/core';

import { DataContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';
import { ParaValidator } from '../../validators/ParaValidator';
import { ValueRequiredValidator } from '../../validators/ValueRequiredValidator';

/**
 * | action            | value |
 * |-------------------|-------|
 * | expected:data     | xxxx  |
 * | expected:data#a.b | xxxx  |
 */
export class ExpectedDataExecutinoUnit implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    readonly parameterType = ParaType.Optional;
    readonly selectorType = SelectorType.Optional;
    readonly validators = [new ParaValidator(['regexp']), new ValueRequiredValidator('value')];

    /**
     *
     */
    constructor(private executionType?: 'data' | 'header' | 'transformed') {}

    /**
     *
     */
    get description(): string {
        return !this.executionType ? 'expected' : `expected:${this.executionType}`;
    }

    /**
     *
     */
    private getDataContent(context: DataContext): DataContent {
        switch (this.executionType) {
            case 'header':
                return context.execution.header;

            case 'transformed':
                return context.execution.transformed;

            default:
                return context.execution.data;
        }
    }

    /**
     *
     */
    execute(context: DataContext, row: RowTypeValue<DataContext>): void {
        const expected = row.value.toString();
        const baseContent = DataContentHelper.create(this.getDataContent(context));
        const data = !row.selector ? baseContent.getText() : DataContentHelper.getByPath(row.selector, baseContent).getText();

        if (row.actionPara === 'regexp') {
            const match = data.match(row.value.toString());
            const matchedValue = !match ? '' : match[0];
            if (data !== matchedValue) {
                throw Error(`expected regexp value (${data}) does not match with the exctracted value '${matchedValue}'`);
            }
        } else {
            if (expected !== data) {
                throw Error(`error: ${this.description}\n\texpected: ${expected}\n\tactual: ${data}`);
            }
        }
    }
}
