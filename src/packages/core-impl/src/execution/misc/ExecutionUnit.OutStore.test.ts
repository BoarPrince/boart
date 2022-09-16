import {
    DataContent,
    ExecutionContext,
    ExecutionEngine,
    ExecutionUnit,
    NullContent,
    ObjectContent,
    RowDefinition,
    Store,
    StoreWrapper,
    TableHandler,
    TableRowType
} from '@boart/core';

import { DataContext, DataExecutionContext, DataPreExecutionContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';

import { OutStoreExecutionUnit } from './ExecutionUnit.OutStore';

/**
 *
 */
class ExecutionUnitMock implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    /**
     *
     */
    description = 'mock';

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
export type ExtendedDataContext = ExecutionContext<
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
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * O U T : S T O R E
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
const tableHandler = new TableHandler(RowTypeValue, new ExecutionEngineMock());
const sut = new OutStoreExecutionUnit();
const sutData = new OutStoreExecutionUnit('data');
const sutHeader = new OutStoreExecutionUnit('header');
const sutTransformed = new OutStoreExecutionUnit('transformed');
const sutPayload = new OutStoreExecutionUnit('payload');

/**
 *
 */
beforeEach(() => {
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
beforeEach(() => {
    Store.instance.testStore.clear();
    Store.instance.globalStore.clear();
    Store.instance.localStore.clear();
    Store.instance.stepStore.clear();
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
            tableHandler.executionEngine.context.execution.transformed = data;
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

            expect(Store.instance.testStore.get('var').toString()).toBe(expected);
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
        ['value can be picked from global store', Store.instance.globalStore, new ObjectContent({ a: 'b' }), ':g#a', '', 'b'], //
        ['regular way from test store', Store.instance.testStore, new ObjectContent({ a: 'b' }), ':t', '', '{"a":"b"}'],
        ['regular way from local store', Store.instance.localStore, new ObjectContent({ a: 'b' }), ':l', '', '{"a":"b"}'],
        ['regular way from step store', Store.instance.stepStore, new ObjectContent({ a: 'b' }), ':s', '', '{"a":"b"}'],
        [
            'deep value can be picked and set to step store',
            Store.instance.stepStore,
            new ObjectContent({ a: 'b' }),
            ':s#a',
            '#b',
            '{"b":"b"}'
        ]
    ])(
        `%s, data: %s, store postfix: %s, var postfix: %s, expected %s`,
        async (_: string, storeWrapper: StoreWrapper, data: DataContent, storePostfix: string, varPostfix: string, expected: string) => {
            tableHandler.executionEngine.context.execution.transformed = data;
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

            expect(storeWrapper.get('var').toString()).toBe(expected);
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
        ['1. regular way for data', 'data', new ObjectContent({ a: 'b' }), ':data', '', '{"a":"b"}'], //
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
            tableHandler.executionEngine.context.execution[type] = data;
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

            expect(Store.instance.testStore.get('var').toString()).toBe(expected);
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
        tableHandler.executionEngine.context.execution.data = new NullContent();
        tableHandler.executionEngine.context.execution.transformed = new NullContent();
        tableHandler.executionEngine.context.preExecution.payload = new ObjectContent({ a: 1 });

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

        expect(Store.instance.testStore.get('var').toString()).toBe('{"a":1}');
    });

    /**
     *
     */
    it('use explicit payload, if no execution result exists', async () => {
        tableHandler.executionEngine.context.execution.data = new ObjectContent({ a: 1 });
        tableHandler.executionEngine.context.execution.transformed = new ObjectContent({ b: 2 });
        tableHandler.executionEngine.context.preExecution.payload = new ObjectContent({ c: 3 });

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

        expect(Store.instance.testStore.get('var').toString()).toBe('{"c":3}');
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
        (tableHandler.executionEngine.context as ExtendedDataContext).execution.extendedProperty = 'xxx';

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

        expect(Store.instance.testStore.get('var').toString()).toBe('xxx');
    });

    /**
     *
     */
    it('use other property with extended data context and key', async () => {
        (tableHandler.executionEngine.context as ExtendedDataContext).execution.extendedPropertyWithKey = { key: 'xxx' };

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

        expect(Store.instance.testStore.get('var').toString()).toBe('xxx');
    });
});
