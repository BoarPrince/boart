import { DataContentHelper, ExecutionUnit, ParaType, SelectorExtractor, SelectorType } from '@boart/core';

import { DataContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';
import { JsonLogic } from '../../jsonlogic/JsonLogic';
import { DataScopeValidator } from '../../validators/DataScopeValidator';
import { ParaValidator } from '../../validators/ParaValidator';
import { ValueRequiredValidator } from '../../validators/ValueRequiredValidator';

/**
 * | action               | value |
 * |----------------------|-------|
 * | transform:jsonLogic  | xxxx  |
 */
export class TransformJsonLogicExecutionUnit implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    readonly description = {
        id: '389a6464-7568-4759-a7fd-820ad678794f',
        title: 'transform:jsonLogic',
        dataScope: '*',
        description: null,
        examples: null
    };
    readonly parameterType = ParaType.Optional;
    readonly selectorType = SelectorType.Optional;
    readonly validators = [
        new DataScopeValidator(['data', 'header', 'transformed', '']), //
        new ParaValidator(null), // no para is allowed
        new ValueRequiredValidator('value')
    ];

    /**
     *
     */
    private getSourceData(context: DataContext, executionType: string): object {
        switch (executionType) {
            case 'data':
                return context.execution.data;

            case 'header':
                return context.execution.header;

            default:
                return !!context.execution.transformed && !!context.execution.transformed.getValue()
                    ? context.execution.transformed
                    : context.execution.data;
        }
    }

    /**
     *
     */
    execute(context: DataContext, row: RowTypeValue<DataContext>): void {
        const rule = row.value.toString();
        const data = DataContentHelper.create(this.getSourceData(context, row.ast.datascope?.value)).getText();

        const transformedResult = DataContentHelper.create(JsonLogic.instance.transform(rule, data));

        context.execution.transformed = !row.selector
            ? transformedResult
            : SelectorExtractor.setValueBySelector(row.ast.selectors, transformedResult, context.execution.transformed);
    }
}
