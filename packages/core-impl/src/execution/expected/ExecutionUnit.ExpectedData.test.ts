import 'jest-extended';
import {
    DataContent,
    ExecutionEngine,
    ExecutionUnit,
    NativeContent,
    NullContent,
    ObjectContent,
    RowDefinition,
    TableHandler,
    TableRowType,
    TextContent
} from '@boart/core';

import { DataContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';

import { ExpectedDataExecutinoUnit } from './ExecutionUnit.ExpectedData';
import { ExpectedOperator } from './ExpectedOperator';
import { ExpectedOperatorInitializer } from './ExpectedOperatorInitializer';

/**
 *
 */
class ExecutionUnitMock implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    /**
     *
     */
    description = 'desc';

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
    execute = jest.fn(async (context: DataContext, row: RowTypeValue<DataContext>): Promise<void> => {
        // do noting
        return;
    });
}

/**
 *
 */
class RestCallExecutionEngine extends ExecutionEngine<DataContext, RowTypeValue<DataContext>> {
    /**
     *
     */
    constructor() {
        super(new ExecutionUnitMock(), RestCallExecutionEngine.initializer());
    }

    /**
     *
     */
    private static initializer(): () => DataContext {
        return (): DataContext => ({
            config: {
                value: ''
            },
            preExecution: {
                value: ''
            },
            execution: {
                data: new NullContent(),
                transformed: new NullContent(),
                header: null
            }
        });
    }
}

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * E X P E C T E D : D A T A
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('check expected:data execution units', () => {
    const tableHandler = new TableHandler(RowTypeValue, new RestCallExecutionEngine());

    const sut = new ExpectedDataExecutinoUnit('data');

    tableHandler.addRowDefinition(
        new RowDefinition({
            type: TableRowType.PostProcessing,
            executionUnit: sut,
            validators: null
        })
    );

    /**
     *
     */
    describe('check correct', () => {
        /**
         *
         */
        it.each([
            ['1. string false', new TextContent('false'), 'false'],
            ['2. string true', new TextContent('true'), 'true'],
            ['3. boolean false', new NativeContent(false), 'false'],
            ['4. boolean true', new NativeContent(true), 'true'],
            ['5. string 0', new TextContent('0'), '0'],
            ['6. string 1', new TextContent('1'), '1'],
            ['7. number 0', new NativeContent(0), '0'],
            ['8. number 1', new NativeContent(1), '1'],
            ['9. object', new ObjectContent({ a: 1, b: 2, c: [3, 4, 5] }), '{"a":1,"b":2,"c":[3,4,5]}'],
            ['10. array', new ObjectContent([1, 2, 3, 4, 5]), '[1,2,3,4,5]']
        ])(`%s, data: %s -> expected: %s `, async (_: string, data: DataContent, expected: string) => {
            tableHandler.executionEngine.context.execution.data = data;
            await tableHandler.process({
                headers: {
                    cells: ['action', 'value']
                },
                rows: [
                    {
                        cells: ['expected:data', expected]
                    }
                ]
            });
        });
    });

    /**
     *
     */
    describe('check with property', () => {
        /**
         *
         */
        it.each([
            ['1. string with deep 1', 'a', new ObjectContent({ a: 'b' }), 'b'],
            ['2. string with deep 2', 'a.b', new ObjectContent({ a: { b: 'c' } }), 'c'],
            ['3. number', 'a.b', new ObjectContent({ a: { b: 10 } }), '10'],
            ['4. boolean (false)', 'a.b', new ObjectContent({ a: { b: false } }), 'false'],
            ['5. boolean (true)', 'a.b', new ObjectContent({ a: { b: true } }), 'true']
        ])(`%s, property: %s, data: %s -> expected: %s `, async (_: string, property: string, data: DataContent, expected: string) => {
            tableHandler.executionEngine.context.execution.data = data;
            await tableHandler.process({
                headers: {
                    cells: ['action', 'value']
                },
                rows: [
                    {
                        cells: [`expected:data#${property}`, expected]
                    }
                ]
            });
        });
    });

    /**
     *
     */
    describe('check failing', () => {
        /**
         *
         */
        it.each([
            ['string false', new TextContent('false'), '"false"'],
            ['number 0', new TextContent('0'), '1']
        ])(`%s, data: %s -> not expected: %s `, async (_: string, data: DataContent, expected: string) => {
            tableHandler.executionEngine.context.execution.data = data;
            try {
                await tableHandler.process({
                    headers: {
                        cells: ['action', 'value']
                    },
                    rows: [
                        {
                            cells: ['expected:data', expected]
                        }
                    ]
                });
            } catch (error) {
                expect(error.message).toStartWith(`error: expected:data`);
                return;
            }

            throw Error('error must be thrown, if value is not expected');
        });
    });
});

/*
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * E X P E C T E D : H E A D E R
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('check expected:header execution units', () => {
    const tableHandler = new TableHandler(RowTypeValue, new RestCallExecutionEngine());

    const sut = new ExpectedDataExecutinoUnit('header');

    tableHandler.addRowDefinition(
        new RowDefinition({
            type: TableRowType.PostProcessing,
            executionUnit: sut,
            validators: null
        })
    );

    /**
     *
     */
    describe('check with property', () => {
        /**
         *
         */
        it.each([
            ['1, string with deep 1', 'a', new ObjectContent({ a: 'b' }), 'b'],
            ['2, string with deep 2', 'a.b', new ObjectContent({ a: { b: 'c' } }), 'c'],
            ['3, number', 'a.b', new ObjectContent({ a: { b: 10 } }), '10'],
            ['4, boolean (false)', 'a.b', new ObjectContent({ a: { b: false } }), 'false'],
            ['5, boolean (true)', 'a.b', new ObjectContent({ a: { b: true } }), 'true']
        ])(`%s, property: %s, data: %s -> expected: %s `, async (_: string, property: string, header: DataContent, expected: string) => {
            tableHandler.executionEngine.context.execution.header = header;
            await tableHandler.process({
                headers: {
                    cells: ['action', 'value']
                },
                rows: [
                    {
                        cells: [`expected:header#${property}`, expected]
                    }
                ]
            });
        });
    });

    /**
     *
     */
    describe('check failing', () => {
        /**
         *
         */
        it.each([
            ['1. string false', 'a', new ObjectContent({ a: 'false' }), '"false"'],
            ['2. number 0', 'a', new ObjectContent({ a: '0' }), '1']
        ])(`%s, data: %s -> not expected: %s `, async (_: string, property: string, header: DataContent, expected: string) => {
            tableHandler.executionEngine.context.execution.header = header;
            try {
                await tableHandler.process({
                    headers: {
                        cells: ['action', 'value']
                    },
                    rows: [
                        {
                            cells: [`expected:header#${property}`, expected]
                        }
                    ]
                });
            } catch (error) {
                expect(error.message).toStartWith(`error: expected:header`);
                return;
            }

            throw Error('error must be thrown, if value is not expected');
        });

        /**
         *
         */
        it('no parameter defined for accessing header', async () => {
            tableHandler.executionEngine.context.execution.header = new ObjectContent({ a: 'b' });
            try {
                await tableHandler.process({
                    headers: {
                        cells: ['action', 'value']
                    },
                    rows: [
                        {
                            cells: ['expected:header', 'b']
                        }
                    ]
                });
            } catch (error) {
                expect(error.message).toBe(`error: expected:header\n\texpected: b\n\tactual: {"a":"b"}`);
                return;
            }

            throw Error('error must be thrown, if value is not expected');
        });
    });
});

/*
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * E X P E C T E D   W I T H   O P E R A T O R
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('check expected:data execution units with operators', () => {
    let tableHandler: TableHandler<DataContext, RowTypeValue<DataContext>>;

    /**
     *
     */
    beforeEach(() => {
        ExpectedOperatorInitializer.instance.clear();
        tableHandler = new TableHandler(RowTypeValue, new RestCallExecutionEngine());
    });

    /**
     *
     */
    class TestOperator implements ExpectedOperator {
        name: string;
        check = jest.fn().mockReturnValue(true);

        /**
         *
         */
        constructor(name: string) {
            this.name = name;
        }
    }

    /**
     *
     */
    it('add operator before', async () => {
        ExpectedOperatorInitializer.instance.addOperator(new TestOperator('op1'));
        const sut = new ExpectedDataExecutinoUnit('data');

        tableHandler.addRowDefinition(
            new RowDefinition({
                type: TableRowType.PostProcessing,
                executionUnit: sut,
                validators: null
            })
        );

        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: ['expected:data:op1', '']
                }
            ]
        });
    });

    /**
     *
     */
    it('add operator after', async () => {
        const sut = new ExpectedDataExecutinoUnit('data');

        tableHandler.addRowDefinition(
            new RowDefinition({
                type: TableRowType.PostProcessing,
                executionUnit: sut,
                validators: null
            })
        );
        ExpectedOperatorInitializer.instance.addOperator(new TestOperator('op2'));

        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: ['expected:data:op2', '']
                }
            ]
        });
    });

    /**
     *
     */
    it('NativeContent value parameter', async () => {
        ExpectedOperatorInitializer.instance.clear();

        const operator = new TestOperator('op1');
        ExpectedOperatorInitializer.instance.addOperator(operator);
        const sut = new ExpectedDataExecutinoUnit('data');

        const dataToCheck = new NativeContent('a');
        tableHandler.executionEngine.context.execution.data = dataToCheck;
        tableHandler.addRowDefinition(
            new RowDefinition({
                type: TableRowType.PostProcessing,
                executionUnit: sut,
                validators: null
            })
        );

        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: ['expected:data:op1', 'b']
                }
            ]
        });

        expect(operator.check).toBeCalledTimes(1);
        expect(operator.check.mock.calls[0][0]).toBeObject();
        expect(operator.check.mock.calls[0][0]).toBeInstanceOf(NativeContent);
        expect(operator.check.mock.calls[0][1]).toBeString();
        expect(operator.check).toBeCalledWith(dataToCheck, 'b');
    });

    /**
     *
     */
    it('ObjectContent value parameter', async () => {
        const operator = new TestOperator('op1');
        ExpectedOperatorInitializer.instance.addOperator(operator);
        const sut = new ExpectedDataExecutinoUnit('data');

        const dataToCheck = new ObjectContent({ a: 'b' });
        tableHandler.executionEngine.context.execution.data = dataToCheck;
        tableHandler.addRowDefinition(
            new RowDefinition({
                type: TableRowType.PostProcessing,
                executionUnit: sut,
                validators: null
            })
        );

        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: ['expected:data:op1', 'b']
                }
            ]
        });

        expect(operator.check).toBeCalledTimes(1);
        expect(operator.check.mock.calls[0][0]).toBeObject();
        expect(operator.check.mock.calls[0][0]).toBeInstanceOf(ObjectContent);
        expect(operator.check.mock.calls[0][1]).toBeString();
        expect(operator.check).toBeCalledWith(dataToCheck, 'b');
    });

    /**
     *
     */
    it('add operator with the same name twice (do not ignore)', () => {
        const operator1 = new TestOperator('op1');
        const operator2 = new TestOperator('op1');

        ExpectedOperatorInitializer.instance.addOperator(operator1);
        expect(() => ExpectedOperatorInitializer.instance.addOperator(operator2)).toThrowError("expected operator 'op1' already exists");
    });

    /**
     *
     */
    it('add operator with the same name twice (ignore equal)', () => {
        const operator1 = new TestOperator('op1');
        const operator2 = new TestOperator('op1');

        ExpectedOperatorInitializer.instance.addOperator(operator1);
        ExpectedOperatorInitializer.instance.addOperator(operator2, true);
    });
});
