import {
    DataContent,
    DataContentHelper,
    DefaultContext,
    DefaultRowType,
    ExecutionUnit,
    ParaType,
    SelectorExtractor,
    SelectorType
} from '@boart/core';
import JSPath from 'jspath';

import { DataScopeValidator } from '../../validators/DataScopeValidator';
import { QualifierValidator } from '../../validators/QualifierValidator';
import { ValueRequiredValidator } from '../../validators/ValueRequiredValidator';

/**
 * | action          | value |
 * |-----------------|-------|
 * | transform:jpath | xxxx  |
 */
export class TransformJPathExecutionUnit implements ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>> {
    readonly key = Symbol('transform:jpath');
    readonly description = () => ({
        id: '0bb11bdd-1628-470d-a7af-d5415d073b3d',
        dataScope: '*',
        description: null,
        examples: null
    });

    readonly parameterType = ParaType.Optional;
    readonly selectorType = SelectorType.Optional;
    readonly validators = [
        new DataScopeValidator(['data', 'header', 'transformed', '']), //
        new QualifierValidator([{ qualifier: 'jpath', paras: null }]), // no para is allowed
        new ValueRequiredValidator('value')
    ];

    /**
     *
     */
    private getSourceData(context: DefaultContext, executionType: string): object {
        const sourceData = () => {
            switch (executionType) {
                case 'data':
                    return context.execution.data;

                case 'header':
                    return context.execution.header;

                default:
                    return !!context.execution.transformed && !!context.execution.transformed.valueOf()
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
    execute(context: DefaultContext, row: DefaultRowType<DefaultContext>): void {
        const rule = row.value.toString();
        const data = this.getSourceData(context, row.ast.datascope?.value);

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

        context.execution.transformed = !row.ast.selectors?.match
            ? transformedResult
            : SelectorExtractor.setValueBySelector(row.ast.selectors, transformedResult, context.execution.transformed as DataContent);
    }
}
