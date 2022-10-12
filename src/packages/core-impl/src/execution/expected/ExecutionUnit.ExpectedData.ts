import { DataContent, DataContentHelper, ExecutionContext, ExecutionUnit, ParaType, RowValidator, SelectorType } from '@boart/core';

import { RowTypeValue } from '../../RowTypeValue';
import { ParaValidator } from '../../validators/ParaValidator';

import { ExpectedOperator, ExpectedOperatorResult } from './ExpectedOperator';
import { ExpectedOperatorImplementation } from './ExpectedOperator.Implementation';
import { ExpectedOperatorInitializer } from './ExpectedOperatorInitializer';

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
    constructor(private firstLevelType?: keyof DataContext['execution'], private secondLevelType?: string) {
        ExpectedOperatorInitializer.instance.operators.subscribe((operator) => {
            this.operators.push(operator);
            this.operators.push({
                name: 'not:' + operator.name,
                check: async (value, expectedValue): Promise<ExpectedOperatorResult> => {
                    const result = await operator.check(value, expectedValue);
                    return {
                        result: !result.result,
                        errorMessage: ':not' + (result.errorMessage || '')
                    };
                }
            });
        });

        // add default implementation
        this.operators.push({
            name: '',
            check: (value, expectedValue) => ExpectedOperatorImplementation.equals.check(value, expectedValue)
        });
        // add default negate
        this.operators.push({
            name: 'not',
            check: (value: DataContent, expectedValue: string): ExpectedOperatorResult => ({
                result: expectedValue.toString() != value.getText()
            })
        });
    }

    /**
     *
     */
    get validators(): ReadonlyArray<RowValidator> {
        return [
            {
                validate: (row) => new ParaValidator(this.operators.map((o) => o.name)).validate(row)
            }
        ];
    }

    /**
     *
     */
    get description(): string {
        return !this.firstLevelType ? 'expected' : `expected:${this.firstLevelType.toString()}`;
    }

    /**
     *
     */
    private getDataContent(context: DataContext): DataContent {
        const firstLevelType = this.firstLevelType?.toString() || 'data';
        const secondLevelType = this.secondLevelType?.toString();

        return !secondLevelType //
            ? context.execution[firstLevelType]
            : context.execution[firstLevelType][secondLevelType];
    }

    /**
     *
     */
    async execute(context: DataContext, row: RowTypeValue<DataContext>): Promise<void> {
        const expected = row.value;
        const baseContent = DataContentHelper.create(this.getDataContent(context));
        const data = !row.selector ? baseContent : DataContentHelper.getByPath(row.selector, baseContent);

        const operatorName = row.actionPara || '';
        const operator = this.operators.find((o) => o.name === operatorName);

        // validate operator input
        operator.validators?.forEach((validator) => {
            validator.validate(row.data, null);
        });

        const expectedResult = await operator.check(data, row.value.toString());

        if (expectedResult.result === false) {
            const description = this.description + (!row.selector ? '' : '#' + row.selector);
            throw Error(
                `error: ${description}` +
                    (!expectedResult.errorMessage
                        ? `\n\t${operatorName}: ${expected.toString()}\n\tactual: ${data.getText()}`
                        : expectedResult.errorMessage)
            );
        }
    }
}
