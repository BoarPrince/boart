import { DataContent, DataContentHelper, ExecutionUnit, ParaType, SelectorType } from '@boart/core';

import { DataContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';
import { JsonLogic } from '../../jsonlogic/JsonLogic';
import { ParaValidator } from '../../validators/ParaValidator';
import { ValueRequiredValidator } from '../../validators/ValueRequiredValidator';

/**
 * | action               | value |
 * |----------------------|-------|
 * | transform:jsonLogic  | xxxx  |
 */
export class TransformJsonLogicExecutionUnit implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    readonly description = 'transform:jsonLogic';
    readonly parameterType = ParaType.Optional;
    readonly selectorType = SelectorType.Optional;
    readonly validators = [
        new ParaValidator(['data', 'header', 'transformed']), //
        new ValueRequiredValidator('value')
    ];

    /**
     *
     */
    private getSourceData(context: DataContext, executionType: string): DataContent {
        switch (executionType) {
            case 'data':
                return context.execution.data;

            case 'header':
                return context.execution.header;

            default:
                return context.execution.transformed;
        }
    }

    /**
     *
     */
    execute(context: DataContext, row: RowTypeValue<DataContext>): void {
        const rule = row.value.toString();
        const data = this.getSourceData(context, row.actionPara).getText();

        const transformedResult = DataContentHelper.create(JsonLogic.instance.transform(rule, data));

        context.execution.transformed = !row.selector
            ? transformedResult
            : DataContentHelper.setByPath(row.selector, transformedResult, context.execution.transformed);
    }
}
