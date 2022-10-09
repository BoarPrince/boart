import {
    ExecutionEngine,
    ExecutionUnit,
    NativeContent,
    ObjectContent,
    RowDefinition,
    TableHandler,
    TableRowType,
    TextContent
} from '@boart/core';

import { DataContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';

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
const initialContext = {
    data: null,
    header: null,
    transformed: null
};

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
                data: initialContext.data,
                transformed: initialContext.transformed,
                header: initialContext.header
            }
        });
    }
}

/**
 *
 */
beforeEach(() => {
    initialContext.data = null;
    initialContext.header = null;
    initialContext.transformed = null;
});

/*
 *
 */
describe('check transform:jsonLogic execution units', () => {
    const tableHandler = new TableHandler(RowTypeValue, () => new ExecutionEngineMock());

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
        initialContext.transformed = new ObjectContent({ a: 1, b: 2 });
        const context = await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`transform:jsonLogic`, '{"var": "a"}']
                }
            ]
        });
        expect(context.execution.transformed).toBeDefined();
        expect(context.execution.transformed).toBeInstanceOf(NativeContent);
        expect(context.execution.transformed.toString()).toBe('1');
    });

    /**
     *
     */
    it('transform (string)', async () => {
        initialContext.transformed = new ObjectContent({ a: 'c', b: 'd' });
        const context = await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`transform:jsonLogic`, '{"var": "a"}']
                }
            ]
        });
        expect(context.execution.transformed).toBeDefined();
        expect(context.execution.transformed).toBeInstanceOf(TextContent);
        expect(context.execution.transformed.toString()).toBe('c');
    });

    /**
     *
     */
    it('transform (boolean)', async () => {
        initialContext.transformed = new ObjectContent({ a: true, b: false });
        const context = await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`transform:jsonLogic`, '{"var": "b"}']
                }
            ]
        });
        expect(context.execution.transformed).toBeDefined();
        expect(context.execution.transformed).toBeInstanceOf(NativeContent);
        expect(context.execution.transformed.toString()).toBe('false');
    });

    /**
     *
     */
    it('transform (array)', async () => {
        initialContext.transformed = new ObjectContent({ a: true, b: [true, false] });
        const context = await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`transform:jsonLogic`, '{"var": "b"}']
                }
            ]
        });
        expect(context.execution.transformed).toBeDefined();
        expect(context.execution.transformed).toBeInstanceOf(ObjectContent);
        expect(context.execution.transformed.toString()).toBe('[true,false]');
    });

    /**
     *
     */
    it('transform (failure - wrong rule)', async () => {
        initialContext.transformed = new ObjectContent({ a: true, b: false });
        try {
            const context = await tableHandler.process({
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

    /**
     *
     */
    it('transform (use selector)', async () => {
        initialContext.transformed = new ObjectContent({ a: true, b: [true, false] });
        const context = await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`transform:jsonLogic#a`, '{"var": "b"}']
                }
            ]
        });
        expect(context.execution.transformed).toBeDefined();
        expect(context.execution.transformed).toBeInstanceOf(ObjectContent);
        expect(context.execution.transformed.toString()).toBe('{"a":[true,false],"b":[true,false]}');
    });

    /**
     *
     */
    it('transform (executionType)', async () => {
        initialContext.data = new ObjectContent({ a: true, b: [true, false] });
        initialContext.transformed = new ObjectContent();
        const context = await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`transform:jsonLogic:data`, '{"var": "a"}']
                }
            ]
        });
        expect(context.execution.transformed).toBeDefined();
        expect(context.execution.transformed).toBeInstanceOf(NativeContent);
        expect(context.execution.transformed.toString()).toBe('true');
    });

    /**
     *
     */
    it('transform (selector and executionType)', async () => {
        initialContext.data = new ObjectContent({ a: true, b: [true, false] });
        initialContext.transformed = new ObjectContent();
        const context = await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`transform:jsonLogic:data#c`, '{"var": "a"}']
                }
            ]
        });
        expect(context.execution.transformed).toBeDefined();
        expect(context.execution.transformed).toBeInstanceOf(ObjectContent);
        expect(context.execution.transformed.toString()).toBe('{"c":true}');
    });

    /**
     *
     */
    it('transform (selector and executionType:header)', async () => {
        initialContext.header = new ObjectContent({ a: true, b: [true, false] });
        initialContext.transformed = new ObjectContent();
        const context = await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`transform:jsonLogic:header#c`, '{"var": "a"}']
                }
            ]
        });
        expect(context.execution.transformed).toBeDefined();
        expect(context.execution.transformed).toBeInstanceOf(ObjectContent);
        expect(context.execution.transformed.toString()).toBe('{"c":true}');
    });

    /**
     *
     */
    it('transform (use selector and executionType:transformed)', async () => {
        initialContext.transformed = new ObjectContent({ a: true, b: [true, false] });
        const context = await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`transform:jsonLogic:transformed#a`, '{"var": "b"}']
                }
            ]
        });
        expect(context.execution.transformed).toBeDefined();
        expect(context.execution.transformed).toBeInstanceOf(ObjectContent);
        expect(context.execution.transformed.toString()).toBe('{"a":[true,false],"b":[true,false]}');
    });
});
