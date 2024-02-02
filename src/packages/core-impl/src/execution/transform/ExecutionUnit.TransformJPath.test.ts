import {
    DefaultContext,
    DefaultRowType,
    ExecutionEngine,
    ExecutionUnit,
    NativeContent,
    ObjectContent,
    RowDefinition,
    TableHandler,
    TableRowType,
    TextContent
} from '@boart/core';

import { TransformJPathExecutionUnit } from './ExecutionUnit.TransformJPath';

/**
 *
 */
class ExecutionUnitMock implements ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>> {
    readonly key = Symbol('desc');
    /**
     *
     */
    description = () => ({
        id: '6ce17ea6-e616-47fb-bd3e-42d5f56ecd27',
        description: '',
        examples: null
    });

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute = jest.fn((context: DefaultContext, row: DefaultRowType<DefaultContext>): Promise<void> => {
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
class ExecutionEngineMock extends ExecutionEngine<DefaultContext, DefaultRowType<DefaultContext>> {
    /**
     *
     */
    constructor() {
        super(() => new ExecutionUnitMock(), ExecutionEngineMock.initializer());
    }

    /**
     *
     */
    private static initializer(): () => DefaultContext {
        return (): DefaultContext => ({
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
describe('check transform:jpath execution units', () => {
    const tableHandler = new TableHandler(DefaultRowType, () => new ExecutionEngineMock());

    const sut = new TransformJPathExecutionUnit();

    /**
     *
     */
    beforeAll(() => {
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('transform'),
                type: TableRowType.PostProcessing,
                executionUnit: sut,
                validators: null
            })
        );
    });

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
                    cells: [`transform:jpath`, '.a']
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
                    cells: [`transform:jpath`, '.a']
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
                    cells: [`transform:jpath`, '.b']
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
                    cells: [`transform:jpath`, '.b']
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
        await expect(() =>
            tableHandler.process({
                headers: {
                    cells: ['action', 'value']
                },
                rows: [
                    {
                        cells: [`transform:jpath`, '.xxx']
                    }
                ]
            })
        ).rejects.toThrow(`cannot evaluate jpath expression, rule: '.xxx', data: {"a":true,"b":false}`);
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
                    cells: [`transform:jpath#a`, '.b']
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
                    cells: [`transform:jpath::data`, '.a']
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
                    cells: [`transform:jpath::data#c`, '.a']
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
                    cells: [`transform:jpath::header#c`, '.a']
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
    it('transform (scope not allowed)', async () => {
        await expect(() =>
            tableHandler.process({
                headers: {
                    cells: ['action', 'value']
                },
                rows: [
                    {
                        cells: [`transform:jpath::head`, '.a']
                    }
                ]
            })
        ).rejects.toThrow(`Datascope 'head' of action 'transform:jpath' is not defined. Allowed is 'data'`);
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
                    cells: [`transform:jpath::transformed#a`, '.b']
                }
            ]
        });
        expect(context.execution.transformed).toBeDefined();
        expect(context.execution.transformed).toBeInstanceOf(ObjectContent);
        expect(context.execution.transformed.toString()).toBe('{"a":[true,false],"b":[true,false]}');
    });
});
