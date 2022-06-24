import { DataContent, DataContentHelper, ExecutionUnit, ParaType, RowValidator, SelectorType } from '@boart/core';

import { DataContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';
import { ParaValidator } from '../../validators/ParaValidator';

import { ExpectedOperator } from './ExpectedOperator';
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
    // readonly avalidators = [
    //     new ParaValidator([
    //         'regexp',
    //         'regexp:not',
    //         'startsWith',
    //         'startsWith:not',
    //         'greater',
    //         'smaller',
    //         'contains',
    //         'contains:not',
    //         'not',
    //         'not:empty',
    //         'empty',
    //         'isArray',
    //         'isArray:not',
    //         'isObject',
    //         'isObject:not',
    //         'count',
    //         'count:greater',
    //         'count:smaller',
    //         'count:not'
    //     ]),
    //     new ValueRequiredValidator('value')
    // ];
    readonly operators = new Array<ExpectedOperator>();

    /**
     *
     */
    constructor(private executionType?: 'data' | 'header' | 'transformed') {
        ExpectedOperatorInitializer.instance.operators.subscribe((operator) => {
            this.operators.push(operator);
            this.operators.push({
                name: operator.name + ':not',
                check: (value, expectedValue) => !operator.check(value, expectedValue)
            });
        });
        // add default implementation
        this.operators.push({
            name: '',
            check: (value: DataContent, expectedValue: string): boolean => expectedValue.toString() == value.getText()
        });
        // add default negate
        this.operators.push({
            name: 'not',
            check: (value: DataContent, expectedValue: string): boolean => expectedValue.toString() != value.getText()
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
    execute(context: DataContext, row: RowTypeValue<DataContext>): void {
        const expected = row.value;
        const baseContent = DataContentHelper.create(this.getDataContent(context));
        const data = !row.selector ? baseContent : DataContentHelper.getByPath(row.selector, baseContent);

        const operatorName = row.actionPara || '';
        const isOK = this.operators.find((o) => o.name === operatorName).check(data, row.value?.toString());
        if (isOK === false) {
            throw Error(`error: ${this.description}\n\texpectd:${operatorName}: ${expected.toString()}\n\tactual: ${data.getText()}`);
        }

        // switch (row.actionPara) {
        //     case 'regexp': {
        //         const match = data.match(expected);
        //         const matchedValue = !match ? '' : match[0];
        //         if (data !== matchedValue) {
        //             throw Error(`expected regexp value (${data}) does not match with the exctracted value '${matchedValue}'`);
        //         }
        //         break;
        //     }
        //     case 'regexp:not': {
        //         const match = data.match(expected);
        //         const matchedValue = !match ? '' : match[0];
        //         if (data === matchedValue) {
        //             throw Error(`expected regexp value (${data}) is matching the exctracted value '${matchedValue}'`);
        //         }
        //         break;
        //     }
        //     case 'startsWith': {
        //         if (!data.startsWith(expected)) {
        //             throw Error(`error: ${this.description}\n\tstartsWith: ${expected}\n\tactual: ${data}`);
        //         }
        //         break;
        //     }
        //     case 'startsWith:not': {
        //         if (data.startsWith(expected)) {
        //             throw Error(`error: ${this.description}\n\tstartsWith:not: ${expected}\n\tactual: ${data}`);
        //         }
        //         break;
        //     }
        //     case 'contains': {
        //         if (!data.includes(expected)) {
        //             throw Error(`error: ${this.description}\n\tcontains: ${expected}\n\tactual: ${data}`);
        //         }
        //         break;
        //     }
        //     case 'contains:not': {
        //         if (data.includes(expected)) {
        //             throw Error(`error: ${this.description}\n\tcontains:not: ${expected}\n\tactual: ${data}`);
        //         }
        //         break;
        //     }
        //     case 'smaller': {
        //         if (parseInt(data) < parseInt(expected)) {
        //             throw Error(`error: ${this.description}\n\tsmaller: ${expected}\n\tactual: ${data}`);
        //         }
        //         break;
        //     }
        //     case 'greater': {
        //         if (parseInt(data) > parseInt(expected)) {
        //             throw Error(`error: ${this.description}\n\tgreater: ${expected}\n\tactual: ${data}`);
        //         }
        //         break;
        //     }
        //     case 'count': {
        //         if (parseInt(data) > parseInt(expected)) {
        //             throw Error(`error: ${this.description}\n\tgreater: ${expected}\n\tactual: ${data}`);
        //         }
        //         break;
        //     }
        //     case 'not': {
        //         if (expected === data) {
        //             throw Error(`error: ${this.description}\n\tnot: ${expected}\n\tactual: ${data}`);
        //         }
        //         break;
        //     }
        //     default: {
        //         if (expected !== data) {
        //             throw Error(`error: ${this.description}\n\texpected: ${expected}\n\tactual: ${data}`);
        //         }
        //     }
        // }
    }
}
