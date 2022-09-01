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

import { DataContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';

import { TransformJPathExecutionUnit } from './ExecutionUnit.TransformJPath';

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
        super(() => new ExecutionUnitMock(), ExecutionEngineMock.initializer());
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
                payload: null
            },
            execution: {
                data: null,
                transformed: null,
                header: null
            }
        });
    }
}

/*
 *
 */
describe('check transform:jpath execution units', () => {
    const tableHandler = new TableHandler(RowTypeValue, new ExecutionEngineMock());

    const sut = new TransformJPathExecutionUnit();

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
        tableHandler.executionEngine.context.execution.transformed = new ObjectContent({ a: 1, b: 2 });
        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`transform:jpath`, '.a']
                }
            ]
        });
        expect(tableHandler.executionEngine.context.execution.transformed).toBeDefined();
        expect(tableHandler.executionEngine.context.execution.transformed).toBeInstanceOf(NativeContent);
        expect(tableHandler.executionEngine.context.execution.transformed.toString()).toBe('1');
    });

    /**
     *
     */
    it('transform (string)', async () => {
        tableHandler.executionEngine.context.execution.transformed = new ObjectContent({ a: 'c', b: 'd' });
        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`transform:jpath`, '.a']
                }
            ]
        });
        expect(tableHandler.executionEngine.context.execution.transformed).toBeDefined();
        expect(tableHandler.executionEngine.context.execution.transformed).toBeInstanceOf(TextContent);
        expect(tableHandler.executionEngine.context.execution.transformed.toString()).toBe('c');
    });

    /**
     *
     */
    it('transform (boolean)', async () => {
        tableHandler.executionEngine.context.execution.transformed = new ObjectContent({ a: true, b: false });
        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`transform:jpath`, '.b']
                }
            ]
        });
        expect(tableHandler.executionEngine.context.execution.transformed).toBeDefined();
        expect(tableHandler.executionEngine.context.execution.transformed).toBeInstanceOf(NativeContent);
        expect(tableHandler.executionEngine.context.execution.transformed.toString()).toBe('false');
    });

    /**
     *
     */
    it('transform (array)', async () => {
        tableHandler.executionEngine.context.execution.transformed = new ObjectContent({ a: true, b: [true, false] });
        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`transform:jpath`, '.b']
                }
            ]
        });
        expect(tableHandler.executionEngine.context.execution.transformed).toBeDefined();
        expect(tableHandler.executionEngine.context.execution.transformed).toBeInstanceOf(ObjectContent);
        expect(tableHandler.executionEngine.context.execution.transformed.toString()).toBe('[true,false]');
    });

    /**
     *
     */
    it('transform (failure - wrong rule)', async () => {
        tableHandler.executionEngine.context.execution.transformed = new ObjectContent({ a: true, b: false });
        try {
            await tableHandler.process({
                headers: {
                    cells: ['action', 'value']
                },
                rows: [
                    {
                        cells: [`transform:jpath`, '.xxx']
                    }
                ]
            });
        } catch (error) {
            expect(error.message).toBe(`cannot evaluate jpath expression, rule: '.xxx', data: {"a":true,"b":false}`);
            return;
        }

        throw Error('error must occur when role is not correct');
    });

    /**
     *
     */
    it('transform (use selector)', async () => {
        tableHandler.executionEngine.context.execution.transformed = new ObjectContent({ a: true, b: [true, false] });
        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`transform:jpath#a`, '.b']
                }
            ]
        });
        expect(tableHandler.executionEngine.context.execution.transformed).toBeDefined();
        expect(tableHandler.executionEngine.context.execution.transformed).toBeInstanceOf(ObjectContent);
        expect(tableHandler.executionEngine.context.execution.transformed.toString()).toBe('{"a":[true,false],"b":[true,false]}');
    });

    /**
     *
     */
    it('transform (executionType)', async () => {
        tableHandler.executionEngine.context.execution.data = new ObjectContent({ a: true, b: [true, false] });
        tableHandler.executionEngine.context.execution.transformed = new ObjectContent();
        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`transform:jpath:data`, '.a']
                }
            ]
        });
        expect(tableHandler.executionEngine.context.execution.transformed).toBeDefined();
        expect(tableHandler.executionEngine.context.execution.transformed).toBeInstanceOf(NativeContent);
        expect(tableHandler.executionEngine.context.execution.transformed.toString()).toBe('true');
    });

    /**
     *
     */
    it('transform (selector and executionType)', async () => {
        tableHandler.executionEngine.context.execution.data = new ObjectContent({ a: true, b: [true, false] });
        tableHandler.executionEngine.context.execution.transformed = new ObjectContent();
        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`transform:jpath:data#c`, '.a']
                }
            ]
        });
        expect(tableHandler.executionEngine.context.execution.transformed).toBeDefined();
        expect(tableHandler.executionEngine.context.execution.transformed).toBeInstanceOf(ObjectContent);
        expect(tableHandler.executionEngine.context.execution.transformed.toString()).toBe('{"c":true}');
    });

    /**
     *
     */
    it('transform (selector and executionType:header)', async () => {
        tableHandler.executionEngine.context.execution.header = new ObjectContent({ a: true, b: [true, false] });
        tableHandler.executionEngine.context.execution.transformed = new ObjectContent();
        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`transform:jpath:header#c`, '.a']
                }
            ]
        });
        expect(tableHandler.executionEngine.context.execution.transformed).toBeDefined();
        expect(tableHandler.executionEngine.context.execution.transformed).toBeInstanceOf(ObjectContent);
        expect(tableHandler.executionEngine.context.execution.transformed.toString()).toBe('{"c":true}');
    });

    /**
     *
     */
    it('transform (use selector and executionType:transformed)', async () => {
        tableHandler.executionEngine.context.execution.transformed = new ObjectContent({ a: true, b: [true, false] });
        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`transform:jpath:transformed#a`, '.b']
                }
            ]
        });
        expect(tableHandler.executionEngine.context.execution.transformed).toBeDefined();
        expect(tableHandler.executionEngine.context.execution.transformed).toBeInstanceOf(ObjectContent);
        expect(tableHandler.executionEngine.context.execution.transformed.toString()).toBe('{"a":[true,false],"b":[true,false]}');
    });
});
