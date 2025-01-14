import {
    DataContent,
    DefaultContext,
    DefaultExecutionContext,
    DefaultPreExecutionContext,
    DefaultRowType,
    ExecutionContext,
    ExecutionEngine,
    ExecutionUnit,
    NullContent,
    ObjectContent,
    RowDefinition,
    SelectorType,
    Store,
    StoreWrapper,
    TableHandler,
    TableRowType,
    VariableParser
} from '@boart/core';

import { OutStoreExecutionUnit } from './ExecutionUnit.OutStore';
import { DataScopeValidator } from '../../validators/DataScopeValidator';

/**
 *
 */
class ExecutionUnitMock implements ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>> {
    readonly key = Symbol('mock');
    readonly selectorType = SelectorType.Optional;

    /**
     *
     */
    description = () => ({
        id: '7a421d98-e54b-457c-bf2e-696a946d9241',
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
type ExtendedDefaultContext = ExecutionContext<
    object,
    DefaultPreExecutionContext,
    DefaultExecutionContext & {
        extendedProperty: string;
    }
>;

/**
 *
 */
const initialContext = {
    execution: {
        data: null,
        transformed: null,
        header: null
    },
    preExecution: {
        payload: null
    }
};

/**
 *
 */
class ExecutionEngineMock<MockContext extends DefaultContext> extends ExecutionEngine<MockContext, DefaultRowType<MockContext>> {
    /**
     *
     */
    constructor() {
        super(() => new ExecutionUnitMock(), ExecutionEngineMock.initializer());
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static initializer(): () => any {
        return (): DefaultContext => ({
            config: {
                value: ''
            },
            preExecution: initialContext.preExecution,
            execution: initialContext.execution
        });
    }
}

/*
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * O U T : S T O R E
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
let tableHandler: TableHandler<any, any>;
const sut = new OutStoreExecutionUnit('store');
const variableParser = new VariableParser();

/**
 *
 */
beforeEach(() => {
    tableHandler = new TableHandler(DefaultRowType, () => new ExecutionEngineMock());
    tableHandler.addRowDefinition(
        new RowDefinition({
            type: TableRowType.PostProcessing,
            executionUnit: sut,
            validators: null
        })
    );

    Store.instance.testStore.clear();
    Store.instance.globalStore.clear();
    Store.instance.localStore.clear();
    Store.instance.stepStore.clear();

    initialContext.execution.data = null;
    initialContext.execution.header = null;
    initialContext.execution.transformed = null;
    initialContext.preExecution.payload = null;
});

/**
 *
 */
afterEach(() => {
    tableHandler.removeAllRowDefinitions();
});

/**
 *
 */
describe('check test store', () => {
    /***
     *
     */
    it.each([
        [1, 'regular way', new ObjectContent({ a: 'b' }), '', '', '{"a":"b"}'], //
        [2, 'deep value can be picked', new ObjectContent({ a: 'b' }), '#a', '', 'b'],
        [3, 'deep value can be set', new ObjectContent({ a: 'b' }), '', '#c', '{"c":{"a":"b"}}'],
        [4, 'deep value can be picked and set', new ObjectContent({ a: 'b' }), '#a', '#b', '{"b":"b"}'],
        [
            5,
            'very deep value can be picked and set',
            new ObjectContent({ a: { b: { c: 'l' } } }),
            '#a.b.c',
            '#e.f.g.h.i.j.k',
            '{"e":{"f":{"g":{"h":{"i":{"j":{"k":"l"}}}}}}}'
        ]
    ])(
        `%s - %s, data: %s, store postfix: %s, var postfix: %s, expected %s`,
        async (_: number, __: string, data: DataContent, storePostfix: string, varPostfix: string, expected: string) => {
            initialContext.execution.transformed = data;
            const tableRow = {
                headers: {
                    cells: ['action', 'value']
                },
                rows: [
                    {
                        cells: [`store${storePostfix}`, `var${varPostfix}`]
                    }
                ]
            };
            await tableHandler.process(tableRow);

            const ast = variableParser.parseAction('store:var');
            expect(Store.instance.testStore.get(ast).toString()).toBe(expected);
        }
    );
});

/**
 *
 */
describe('check all store types', () => {
    /***
     *
     */
    it.each([
        ['value can be picked from global store', Store.instance.globalStore, new ObjectContent({ a: 'b' }), '@g#a', '', 'b'], //
        ['regular way from test store', Store.instance.testStore, new ObjectContent({ a: 'b' }), '@t', '', '{"a":"b"}'],
        ['regular way from local store', Store.instance.localStore, new ObjectContent({ a: 'b' }), '@l', '', '{"a":"b"}'],
        ['regular way from step store', Store.instance.stepStore, new ObjectContent({ a: 'b' }), '@s', '', '{"a":"b"}'],
        [
            'deep value can be picked and set to step store',
            Store.instance.stepStore,
            new ObjectContent({ a: 'b' }),
            '@s#a',
            '#b',
            '{"b":"b"}'
        ]
    ])(
        `%s, %s, data: %s, store postfix: %s, var postfix: %s, expected %s`,
        async (_: string, storeWrapper: StoreWrapper, data: DataContent, storePostfix: string, varPostfix: string, expected: string) => {
            initialContext.execution.transformed = data;
            await tableHandler.process({
                headers: {
                    cells: ['action', 'value']
                },
                rows: [
                    {
                        cells: [`store${storePostfix}`, `var${varPostfix}`]
                    }
                ]
            });

            const ast = variableParser.parseAction('store:var');
            expect(storeWrapper.get(ast).toString()).toBe(expected);
        }
    );
});

/**
 *
 */
describe('check data, heading and transformed', () => {
    /***
     *
     */
    it.each([
        ['1. regular way for data', 'data', new ObjectContent({ a: 'b' }), '::data', '', '{"a":"b"}'], //
        ['2. deep value can be picked for data', 'data', new ObjectContent({ a: 'b' }), '::data#a', '', 'b'],
        ['3. deep value can be set for header', 'header', new ObjectContent({ a: 'b' }), '::header', '#c', '{"c":{"a":"b"}}'],
        ['4. deep value can be picked and set for header', 'header', new ObjectContent({ a: 'b' }), '::header#a', '#b', '{"b":"b"}'],
        [
            '5. deep value can be set for transformed',
            'transformed',
            new ObjectContent({ a: 'b' }),
            '::transformed',
            '#c',
            '{"c":{"a":"b"}}'
        ],
        [
            '6. deep value can be picked and set for transformed',
            'transformed',
            new ObjectContent({ a: 'b' }),
            '::transformed#a',
            '#b',
            '{"b":"b"}'
        ]
    ])(
        `%s, data: %s, store postfix: %s, var postfix: %s, expected %s`,
        async (_: string, type: string, data: DataContent, storePostfix: string, varPostfix: string, expected: string) => {
            tableHandler.getExecutionEngine().context.execution[type] = data;
            await tableHandler.process({
                headers: {
                    cells: ['action', 'value']
                },
                rows: [
                    {
                        cells: [`store${storePostfix}`, `var${varPostfix}`]
                    }
                ]
            });

            const ast = variableParser.parseAction('store:var');
            expect(Store.instance.testStore.get(ast).toString()).toBe(expected);
        }
    );
});

/**
 *
 */
describe('check preExecution.payload', () => {
    /**
     *
     */
    it('use default, if no execution result exists', async () => {
        initialContext.execution.data = new NullContent();
        initialContext.execution.transformed = new NullContent();
        initialContext.preExecution.payload = new ObjectContent({ a: 1 });

        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`store`, `var`]
                }
            ]
        });

        const ast = variableParser.parseAction('store:var');
        expect(Store.instance.testStore.get(ast).toString()).toBe('{"a":1}');
    });

    /**
     *
     */
    it('use explicit payload, if no execution result exists', async () => {
        initialContext.execution.data = new ObjectContent({ a: 1 });
        initialContext.execution.transformed = new ObjectContent({ b: 2 });
        initialContext.preExecution.payload = new ObjectContent({ c: 3 });

        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`store::payload`, `var`]
                }
            ]
        });

        const ast = variableParser.parseAction('store:var');
        expect(Store.instance.testStore.get(ast).toString()).toBe('{"c":3}');
    });
});

/**
 *
 */
describe('check extended context', () => {
    /**
     *
     */
    it('use other property with extended data context', async () => {
        (tableHandler.getExecutionEngine().context as ExtendedDefaultContext).execution.extendedProperty = 'xxx';

        const sut = new OutStoreExecutionUnit('store-new');
        (sut as any).validators = [new DataScopeValidator(['extendedProperty'])];

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('store-new'),
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
                    cells: [`store-new::extendedProperty`, `var`]
                }
            ]
        });

        const ast = variableParser.parseAction('store:var');
        expect(Store.instance.testStore.get(ast).toString()).toBe('xxx');
    });

    /**
     *
     */
    it('check wrong dataScope', async () => {
        const sut = new OutStoreExecutionUnit('store-new');

        tableHandler.addRowDefinition(
            new RowDefinition({
                type: TableRowType.PostProcessing,
                executionUnit: sut,
                validators: [new DataScopeValidator(['data', 'header', 'transformed', ''])]
            })
        );

        await expect(() =>
            tableHandler.process({
                headers: {
                    cells: ['action', 'value']
                },
                rows: [
                    {
                        cells: [`store-new::wrongKey`, `var`]
                    }
                ]
            })
        ).rejects.toThrow(`Datascope 'wrongKey' of action 'store-new' is not defined. Allowed is`);
    });
});

/**
 *
 */
describe('executionContext can be null or undefined', () => {
    /**
     *
     */
    it('transformed is null', async () => {
        initialContext.execution.transformed = null;
        initialContext.execution.data = new ObjectContent({ a: 2 });
        initialContext.preExecution.payload = new ObjectContent({ a: 1 });

        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`store`, `var`]
                }
            ]
        });

        const ast = variableParser.parseAction('store:var');
        expect(Store.instance.testStore.get(ast).valueOf()).toStrictEqual({ a: 2 });
    });

    /**
     *
     */
    it('data is null', async () => {
        initialContext.execution.transformed = null;
        initialContext.execution.data = null;
        initialContext.preExecution.payload = new ObjectContent({ a: 1 });

        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`store`, `var`]
                }
            ]
        });

        const ast = variableParser.parseAction('store:var');
        expect(Store.instance.testStore.get(ast).valueOf()).toStrictEqual({ a: 1 });
    });

    /**
     *
     */
    it('payload is null', async () => {
        initialContext.execution.transformed = null;
        initialContext.execution.data = new ObjectContent({ a: 1 });
        initialContext.preExecution.payload = null;

        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`store`, `var`]
                }
            ]
        });

        const ast = variableParser.parseAction('store:var');
        expect(Store.instance.testStore.get(ast).valueOf()).toStrictEqual({ a: 1 });
    });
});
