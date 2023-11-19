import {
    DataContent,
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

import { DataContext, DataExecutionContext, DataPreExecutionContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';

import { OutStoreExecutionUnit } from './ExecutionUnit.OutStore';

/**
 *
 */
class ExecutionUnitMock implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    selectorType = SelectorType.Optional;

    /**
     *
     */
    description = {
        id: '7a421d98-e54b-457c-bf2e-696a946d9241',
        title: 'mock',
        description: '',
        examples: null
    };

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
type ExtendedDataContext = ExecutionContext<
    object,
    DataPreExecutionContext,
    DataExecutionContext & {
        extendedProperty: string;
        extendedPropertyWithKey: {
            key: string;
        };
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
class ExecutionEngineMock<MockContext extends DataContext> extends ExecutionEngine<MockContext, RowTypeValue<MockContext>> {
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
        return (): DataContext => ({
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
const sut = new OutStoreExecutionUnit();
const sutData = new OutStoreExecutionUnit('data');
const sutHeader = new OutStoreExecutionUnit('header');
const sutTransformed = new OutStoreExecutionUnit('transformed');
const sutPayload = new OutStoreExecutionUnit('payload');
const variableParser = new VariableParser();

/**
 *
 */
beforeEach(() => {
    tableHandler = new TableHandler(RowTypeValue, () => new ExecutionEngineMock());
    tableHandler.addRowDefinition(
        new RowDefinition({
            type: TableRowType.PostProcessing,
            executionUnit: sut,
            validators: null
        })
    );
    tableHandler.addRowDefinition(
        new RowDefinition({
            type: TableRowType.PostProcessing,
            executionUnit: sutData,
            validators: null
        })
    );
    tableHandler.addRowDefinition(
        new RowDefinition({
            type: TableRowType.PostProcessing,
            executionUnit: sutHeader,
            validators: null
        })
    );
    tableHandler.addRowDefinition(
        new RowDefinition({
            type: TableRowType.PostProcessing,
            executionUnit: sutTransformed,
            validators: null
        })
    );
    tableHandler.addRowDefinition(
        new RowDefinition({
            type: TableRowType.PostProcessing,
            executionUnit: sutPayload,
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
        ['regular way', new ObjectContent({ a: 'b' }), '', '', '{"a":"b"}'], //
        ['deep value can be picked', new ObjectContent({ a: 'b' }), '#a', '', 'b'],
        ['deep value can be set', new ObjectContent({ a: 'b' }), '', '#c', '{"c":{"a":"b"}}'],
        ['deep value can be picked and set', new ObjectContent({ a: 'b' }), '#a', '#b', '{"b":"b"}'],
        [
            'very deep value can be picked and set',
            new ObjectContent({ a: { b: { c: 'l' } } }),
            '#a.b.c',
            '#e.f.g.h.i.j.k',
            '{"e":{"f":{"g":{"h":{"i":{"j":{"k":"l"}}}}}}}'
        ]
    ])(
        `%s, data: %s, store postfix: %s, var postfix: %s, expected %s`,
        async (_: string, data: DataContent, storePostfix: string, varPostfix: string, expected: string) => {
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
        ['2. deep value can be picked for data', 'data', new ObjectContent({ a: 'b' }), ':data#a', '', 'b'],
        ['3. deep value can be set for header', 'header', new ObjectContent({ a: 'b' }), ':header', '#c', '{"c":{"a":"b"}}'],
        ['4. deep value can be picked and set for header', 'header', new ObjectContent({ a: 'b' }), ':header#a', '#b', '{"b":"b"}'],
        ['5. deep value can be set for transformed', 'transformed', new ObjectContent({ a: 'b' }), ':transformed', '#c', '{"c":{"a":"b"}}'],
        [
            '6. deep value can be picked and set for transformed',
            'transformed',
            new ObjectContent({ a: 'b' }),
            ':transformed#a',
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
                    cells: [`store:payload`, `var`]
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
        (tableHandler.getExecutionEngine().context as ExtendedDataContext).execution.extendedProperty = 'xxx';

        const sut = new OutStoreExecutionUnit<ExtendedDataContext>('extendedProperty');
        sut.key = 'store';

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
                    cells: [`store`, `var`]
                }
            ]
        });

        const ast = variableParser.parseAction('store:var');
        expect(Store.instance.testStore.get(ast).toString()).toBe('xxx');
    });

    /**
     *
     */
    it('use other property with extended data context and key', async () => {
        (tableHandler.getExecutionEngine().context as ExtendedDataContext).execution.extendedPropertyWithKey = { key: 'xxx' };

        const sut = new OutStoreExecutionUnit<ExtendedDataContext>('extendedPropertyWithKey', 'key');
        sut.key = 'store';

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
                    cells: [`store`, `var`]
                }
            ]
        });

        const ast = variableParser.parseAction('store:var');
        expect(Store.instance.testStore.get(ast).toString()).toBe('xxx');
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
