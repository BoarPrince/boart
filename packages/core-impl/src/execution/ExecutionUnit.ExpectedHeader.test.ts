import {
    DataContent,
    ExecutionEngine,
    ExecutionUnit,
    NullContent,
    ObjectContent,
    RowDefinition,
    TableHandler,
    TableRowType
} from '@boart/core';
import { DataContext } from '../DataExecutionContext';
import { RowTypeValue } from '../RowTypeValue';
import { ExpectedHeaderExecutinoUnit } from './ExecutionUnit.ExpectedHeader';

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

/*
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * E X P E C T E D : H E A D E R
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('check expected:header execution units', () => {
    const tableHandler = new TableHandler(RowTypeValue, new RestCallExecutionEngine());

    const sut = new ExpectedHeaderExecutinoUnit();

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
                        cells: [`expected:header:${property}`, expected]
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
                            cells: [`expected:header:${property}`, expected]
                        }
                    ]
                });
            } catch (error) {
                expect(error.message).toStartWith(`expected:header:`);
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
                expect(error.message).toBe("'undefined': key 'expected:header' must have a parameter!");
                return;
            }

            throw Error('error must be thrown, if value is not expected');
        });
    });
});
