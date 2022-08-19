import { DataContentHelper, ExecutionUnit, ParaType, SelectorType } from '@boart/core';
import JSPath from 'jspath';

import { DataContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';
import { ParaValidator } from '../../validators/ParaValidator';
import { ValueRequiredValidator } from '../../validators/ValueRequiredValidator';

/**
 * | action          | value |
 * |-----------------|-------|
 * | transform:jpath | xxxx  |
 */
export class TransformJPathExecutionUnit implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    readonly description = 'transform:jpath';
    readonly parameterType = ParaType.Optional;
    readonly selectorType = SelectorType.Optional;
    readonly validators = [
        new ParaValidator(['data', 'header', 'transformed']), //
        new ValueRequiredValidator('value')
    ];

    /**
     *
     */
    private getSourceData(context: DataContext, executionType: string): object {
        const sourceData = () => {
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
        };

        const data = sourceData();
        return JSON.parse(DataContentHelper.create(data || null).toJSON()) as object;
    }

    /**
     *
     */
    execute(context: DataContext, row: RowTypeValue<DataContext>): void {
        const rule = row.value.toString();
        const data = this.getSourceData(context, row.actionPara);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const transformedValue = JSPath.apply(rule, data) as ReadonlyArray<object>;
        if (!transformedValue || (Array.isArray(transformedValue) && transformedValue.length === 0)) {
            throw new Error(`cannot evaluate jpath expression, rule: '${rule}', data: ${JSON.stringify(data)}`);
        }

        const transformedResult =
            Array.isArray(transformedValue) && transformedValue.length === 1
                ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                  DataContentHelper.create(transformedValue[0])
                : DataContentHelper.create(transformedValue);

        context.execution.transformed = !row.selector
            ? transformedResult
            : DataContentHelper.setByPath(row.selector, transformedResult, context.execution.transformed);
    }
}