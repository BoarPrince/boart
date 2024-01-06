import {
    DataContent,
    DataContentHelper,
    ExecutionContext,
    ExecutionUnit,
    ExpectedOperator,
    Description,
    ExpectedOperatorInitializer,
    ParaType,
    RowValidator,
    SelectorExtractor,
    SelectorType
} from '@boart/core';

import { RowTypeValue } from '../../RowTypeValue';
import { QualifierValidator } from '../../validators/QualifierValidator';
import { DataScope } from '@boart/core/lib/parser/ast/DataScope';

/**
 * | action            | value |
 * |-------------------|-------|
 * | expected:data     | xxxx  |
 * | expected:data#a.b | xxxx  |
 */
export class ExpectedDataExecutinoUnit<DataContext extends ExecutionContext<object, object, object>>
    implements ExecutionUnit<DataContext, RowTypeValue<DataContext>>
{
    readonly parameterType = ParaType.Optional;
    readonly selectorType = SelectorType.Optional;
    readonly operators = new Array<ExpectedOperator>();

    /**
     *
     */
    constructor() {
        ExpectedOperatorInitializer.instance.operators$.subscribe((operator) => this.operators.push(operator));
    }

    /**
     *
     */
    get validators(): ReadonlyArray<RowValidator> {
        return [
            {
                validate: (row) => {
                    new QualifierValidator(
                        this.operators //
                            .map((o) => ({ qualifier: o.name, paras: null }))
                            // add default operator
                            .concat([{ qualifier: null, paras: null }])
                    ).validate(row);
                }
            }
        ];
    }

    /**
     *
     */
    get description(): () => Description {
        return () => ({
            id: 'expected-unit',
            title: 'expected',
            description: null,
            examples: null
        });
    }

    /**
     *
     */
    private getDataContent(context: DataContext, dataScope: DataScope): DataContent {
        return context.execution[dataScope?.value ?? 'data']
    }

    /**
     *
     */
    async execute(context: DataContext, row: RowTypeValue<DataContext>): Promise<void> {
        const expected = row.value;
        const baseContent = DataContentHelper.create(this.getDataContent(context, row.ast.datascope));

        const data = !row.ast.selectors?.length //
            ? baseContent
            : SelectorExtractor.getValueBySelector(row.ast.selectors, baseContent);

        const operatorName = row.ast.qualifier?.stringValue || '';
        const operator = this.operators.find((o) => o.name === operatorName);

        // validate operator input
        operator.validators?.forEach((validator) => {
            validator.validate(row.data, null);
        });

        const value = data.getValue();
        const expectedValue = row.value == null ? (row.value as string) : row.value.toString();
        const expectedResult = await operator.check(value, expectedValue);

        if (expectedResult.result === false) {
            throw Error(
                `error: ${row.ast.match}` +
                    (!expectedResult.errorMessage
                        ? `\n\t${operatorName}: ${expected?.toString()}\n\tactual: ${data.getText()}`
                        : expectedResult.errorMessage)
            );
        }
    }
}
