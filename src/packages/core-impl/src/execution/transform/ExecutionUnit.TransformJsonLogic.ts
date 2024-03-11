import {
    ContentType,
    DataContentHelper,
    DefaultContext,
    DefaultRowType,
    ExecutionUnit,
    ParaType,
    SelectorExtractor,
    SelectorType
} from '@boart/core';

import { JsonLogic } from '../../jsonlogic/JsonLogic';
import { DataScopeValidator } from '../../validators/DataScopeValidator';
import { QualifierValidator } from '../../validators/QualifierValidator';
import { ValueRequiredValidator } from '../../validators/ValueRequiredValidator';

/**
 * | action               | value |
 * |----------------------|-------|
 * | transform:jsonLogic  | xxxx  |
 */
export class TransformJsonLogicExecutionUnit implements ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>> {
    readonly key = Symbol('transform:jsonLogic');
    readonly description = () => ({
        id: '389a6464-7568-4759-a7fd-820ad678794f',
        dataScope: '*',
        description: null,
        examples: null
    });
    readonly parameterType = ParaType.Optional;
    readonly selectorType = SelectorType.Optional;
    readonly validators = [
        new DataScopeValidator(['data', 'header', 'transformed', '']), //
        new QualifierValidator([{ qualifier: 'jsonLogic', paras: null }]), // no qualifier is allowed
        new ValueRequiredValidator('value')
    ];

    /**
     *
     */
    private getSourceData(context: DefaultContext, executionType: string): ContentType {
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
    }

    /**
     *
     */
    execute(context: DefaultContext, row: DefaultRowType<DefaultContext>): void {
        const rule = row.value.toString();
        const data = DataContentHelper.create(this.getSourceData(context, row.ast.datascope?.value)).getText();

        const transformedResult = DataContentHelper.create(JsonLogic.instance.transform(rule, data));

        context.execution.transformed = !row.ast.selectors?.match
            ? transformedResult
            : SelectorExtractor.setValueBySelector(
                  row.ast.selectors,
                  transformedResult,
                  DataContentHelper.create(context.execution.transformed)
              );
    }
}
