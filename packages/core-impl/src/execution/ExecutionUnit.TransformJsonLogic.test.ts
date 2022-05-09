import {
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
import { DataContext } from '../DataExecutionContext';
import { RowTypeValue } from '../RowTypeValue';

import { TransformJsonLogicExecutionUnit } from './ExecutionUnit.TransformJsonLogic';

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
class ExecutionEngineMock extends ExecutionEngine<DataContext, RowTypeValue<DataContext>> {
    /**
     *
     */
    constructor() {
        super(new ExecutionUnitMock(), ExecutionEngineMock.initializer());
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
 *
 */
describe('check transform:jsonLogic execution units', () => {
    const tableHandler = new TableHandler(RowTypeValue, new ExecutionEngineMock());

    const sut = new TransformJsonLogicExecutionUnit();

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
    it('transform (number)', async () => {
        tableHandler.executionEngine.context.execution.data = new ObjectContent({ a: 1, b: 2 });
        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`transform:jsonLogic`, '{"var": "a"}']
                }
            ]
        });
        expect(tableHandler.executionEngine.context.execution.data).toBeDefined();
        expect(tableHandler.executionEngine.context.execution.data).toBeInstanceOf(NativeContent);
        expect(tableHandler.executionEngine.context.execution.data.toString()).toBe('1');
    });

    /**
     *
     */
    it('transform (string)', async () => {
        tableHandler.executionEngine.context.execution.data = new ObjectContent({ a: 'c', b: 'd' });
        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`transform:jsonLogic`, '{"var": "a"}']
                }
            ]
        });
        expect(tableHandler.executionEngine.context.execution.data).toBeDefined();
        expect(tableHandler.executionEngine.context.execution.data).toBeInstanceOf(TextContent);
        expect(tableHandler.executionEngine.context.execution.data.toString()).toBe('c');
    });

    /**
     *
     */
    it('transform (boolean)', async () => {
        tableHandler.executionEngine.context.execution.data = new ObjectContent({ a: true, b: false });
        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`transform:jsonLogic`, '{"var": "b"}']
                }
            ]
        });
        expect(tableHandler.executionEngine.context.execution.data).toBeDefined();
        expect(tableHandler.executionEngine.context.execution.data).toBeInstanceOf(NativeContent);
        expect(tableHandler.executionEngine.context.execution.data.toString()).toBe('false');
    });

    /**
     *
     */
    it('transform (array)', async () => {
        tableHandler.executionEngine.context.execution.data = new ObjectContent({ a: true, b: [true, false] });
        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`transform:jsonLogic`, '{"var": "b"}']
                }
            ]
        });
        expect(tableHandler.executionEngine.context.execution.data).toBeDefined();
        expect(tableHandler.executionEngine.context.execution.data).toBeInstanceOf(ObjectContent);
        expect(tableHandler.executionEngine.context.execution.data.toString()).toBe('[true,false]');
    });

    /**
     *
     */
    it('transform (failure - wrong rule)', async () => {
        tableHandler.executionEngine.context.execution.data = new ObjectContent({ a: true, b: false });
        try {
            await tableHandler.process({
                headers: {
                    cells: ['action', 'value']
                },
                rows: [
                    {
                        cells: [`transform:jsonLogic`, '{"va": "b"}']
                    }
                ]
            });
        } catch (error) {
            expect(error.message).toBe('cannot apply rule {"va": "b"}\nUnrecognized operation va');
            return;
        }

        throw Error('error must occur when role is not correct');
    });
});
