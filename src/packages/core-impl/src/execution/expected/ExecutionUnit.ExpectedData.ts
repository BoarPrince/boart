import {
    DataContent,
    DataContentHelper,
    ExecutionContext,
    ExecutionUnit,
    ExpectedOperator,
    ExpectedOperatorInitializer,
    ExpectedOperatorResult,
    NativeType,
    ParaType,
    RowValidator,
    SelectorType
} from '@boart/core';
import { Description } from 'core/src/description/Description';

import { RowTypeValue } from '../../RowTypeValue';
import { ParaValidator } from '../../validators/ParaValidator';

import { ExpectedOperatorImplementation } from './ExpectedOperator.Implementation';

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
    private generateNotOperator(operator: ExpectedOperator): ExpectedOperator {
        return {
            name: operator.name + (!!operator.name ? ':' : '') + 'not',
            canCaseInsesitive: operator.canCaseInsesitive,
            check: async (value, expectedValue): Promise<ExpectedOperatorResult> => {
                const result = await operator.check(value, expectedValue);
                return {
                    result: !result.result
                };
            }
        };
    }

    /**
     *
     */
    private generateCIOperator(operator: ExpectedOperator): ExpectedOperator {
        const lowercase = (value: NativeType): string => value?.toString()?.toLowerCase() || '';

        return {
            name: operator.name + (!!operator.name ? ':' : '') + 'ci',
            canCaseInsesitive: true,
            check: async (value, expectedValue): Promise<ExpectedOperatorResult> => {
                const result = await operator.check(lowercase(value), lowercase(expectedValue));
                return {
                    result: result.result
                };
            }
        };
    }

    /**
     *
     */
    constructor(private firstLevelType?: keyof DataContext['execution'], private secondLevelType?: string) {
        ExpectedOperatorInitializer.instance.operators$.subscribe((operator) => {
            this.operators.push(operator);

            // add not: operator
            this.operators.push(this.generateNotOperator(operator));

            // add :ci operator
            if (operator.canCaseInsesitive) {
                const ciOperator = this.generateCIOperator(operator);
                this.operators.push(ciOperator);
                this.operators.push(this.generateNotOperator(ciOperator));
            }
        });

        // add default implementation
        if (!ExpectedOperatorInitializer.instance.exists('')) {
            ExpectedOperatorInitializer.instance.addOperator({
                name: '',
                canCaseInsesitive: true,
                check: (value, expectedValue) => ExpectedOperatorImplementation.equals.check(value, expectedValue)
            });
        }
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
    get description(): Description {
        return {
            id: '31f46a7e-8cc0-4ebf-ae63-a9d30a2cafb4',
            title: !this.firstLevelType ? 'expected' : `expected:${this.firstLevelType.toString()}`,
            description: null,
            examples: null
        };
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

        const value = data.getValue();
        const expectedValue = row.value == null ? (row.value as string) : row.value.toString();
        const expectedResult = await operator.check(value, expectedValue);

        if (expectedResult.result === false) {
            const description = this.description.title + (!row.selector ? '' : '#' + row.selector);
            throw Error(
                `error: ${description}` +
                    (!expectedResult.errorMessage
                        ? `\n\t${operatorName}: ${expected?.toString()}\n\tactual: ${data.getText()}`
                        : expectedResult.errorMessage)
            );
        }
    }
}
