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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute = jest.fn((context: DataContext, row: RowTypeValue<DataContext>): Promise<void> => {
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

    const sut = new ExpectedDataExecutinoUnit();

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
                expect(error.message).toStartWith(`expected:data:`);
                return;
            }

            throw Error('error must be thrown, if value is not expected');
        });
    });
});
