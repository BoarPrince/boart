import { DataContent, DataContentHelper, ExecutionUnit, ParaType, RowValidator, SelectorType } from '@boart/core';

import { DataContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';
import { ParaValidator } from '../../validators/ParaValidator';

import { ExpectedOperator, ExpectedOperatorResult } from './ExpectedOperator';
import { ExpectedOperatorInitializer } from './ExpectedOperatorInitializer';

/**
 * | action            | value |
 * |-------------------|-------|
 * | expected:data     | xxxx  |
 * | expected:data#a.b | xxxx  |
 */
export class ExpectedDataExecutinoUnit implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    readonly parameterType = ParaType.Optional;
    readonly selectorType = SelectorType.Optional;
    readonly operators = new Array<ExpectedOperator>();

    /**
     *
     */
    constructor(private executionType?: 'data' | 'header' | 'transformed') {
        ExpectedOperatorInitializer.instance.operators.subscribe((operator) => {
            this.operators.push(operator);
            this.operators.push({
                name: 'not:' + operator.name,
                check: async (value, expectedValue): Promise<ExpectedOperatorResult> => {
                    const result = await operator.check(value, expectedValue);
                    return {
                        result: !result.result,
                        errorMessage: result.errorMessage
                    };
                }
            });
        });
        // add default implementation
        this.operators.push({
            name: '',
            check: (value: DataContent, expectedValue: string): ExpectedOperatorResult => ({
                result: expectedValue.toString() == value.getText(),
                errorMessage: `error: ${this.description}\n\texpected: ${expectedValue.toString()}\n\tactual: ${value.getText()}`
            })
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
            throw Error(
                `error: ${this.description}` +
                    (!expectedResult.errorMessage
                        ? `\n\texpected:${operatorName}: ${expected.toString()}\n\tactual: ${data.getText()}`
                        : ', ' + expectedResult.errorMessage)
            );
        }
    }
}
