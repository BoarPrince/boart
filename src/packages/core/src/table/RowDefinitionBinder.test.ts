/* eslint-disable jest/no-conditional-in-test */
/* eslint-disable jest/no-conditional-expect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'jest-extended';
import { DescriptionHandler } from '../description/DescriptionHandler';
import { ExecutionUnit } from '../execution/ExecutionUnit';
import { ParaType } from '../types/ParaType';
import { SelectorType } from '../types/SelectorType';

import { AnyBaseRowType } from './BaseRowType';
import { RowDefinition } from './RowDefinition';
import { RowDefinitionBinder } from './RowDefinitionBinder';
import { MetaInfo } from './TableMetaInfo';
import { key, value } from './TableRowDecorator';
import { TableRowType } from './TableRowType';

/**
 *
 */
const metaInfo: MetaInfo = {
    tableName: 'test-table',
    key: 'action',
    values: ['value1']
};

/**
 *
 */
class RowWithOneValue extends AnyBaseRowType {
    @key()
    get action() {
        return this.data.ast.name.value;
    }

    get actionPara() {
        return this.data.ast.qualifier?.stringValue ?? null;
    }

    @value()
    get value1() {
        return this.data.values_replaced['value1'];
    }
}

/**
 *
 */
it('check null parameter', () => {
    const sut = new RowDefinitionBinder(null, null, null, null);
    expect(sut.bind(null)).toBeUndefined();
});

/**
 *
 */
it('check simple binding', () => {
    const rowDefinitions = [
        new RowDefinition({
            key: Symbol('aa'),
            type: TableRowType.PostProcessing,
            executionUnit: null,
            validators: null
        })
    ];
    const rawRows = [{ key: 'aa', ast: null, values_replaced: { value1: 'b' } }];

    const sut = new RowDefinitionBinder<any, RowWithOneValue>(metaInfo.tableName, metaInfo, rowDefinitions, rawRows);
    const rows: RowWithOneValue[] = sut.bind(RowWithOneValue);

    expect(rows).toBeDefined();
    expect(rows).toBeInstanceOf(Array);
    expect(rows).toHaveLength(1);
    expect(rows[0].action).toBe('aa');
    expect(rows[0].value1).toBe('b');
});

/**
 *
 */
describe('check binding', () => {
    /**
     *
     */
    it.each([
        ['01.', ['aa'], '', ParaType.False, 'aa', 'aa', null, null],
        ['02.', ['aa'], '', ParaType.Optional, 'aa', 'aa', null, null],
        ['03.', ['aa'], '', ParaType.Optional, 'aa:para', 'aa', 'para', null],
        ['04.', ['a-a'], '', ParaType.Optional, 'a-a:para', 'a-a', 'para', null],
        ['05.', ['aa'], '', ParaType.True, 'aa:para', 'aa', 'para', null],
        ['06.', ['aa'], '', ParaType.True, 'aa:para:1', 'aa', 'para:1', null],
        ['07.', ['aa'], '', ParaType.Optional, 'aa:para:1', 'aa', 'para:1', null],
        ['08.', ['aa'], '', ParaType.Optional, 'aa:para:1#s1', 'aa', 'para:1', 's1'],
        ['09.', ['aa'], '', ParaType.Optional, 'aa:para#s1', 'aa', 'para', 's1'],
        ['10.', ['aa'], '', ParaType.Optional, 'aa#s1', 'aa', null, 's1'],
        ['11.', ['aa'], 'para', ParaType.Optional, 'aa:para#s1', 'aa', 'para', 's1'],
        ['12.', ['aa'], 'para', ParaType.True, 'aa:para', 'aa', 'para', null],
        ['13.', ['aa'], 'para', ParaType.True, 'aa:para:1:2', 'aa', 'para:1:2', null],
        ['14.', ['aa'], 'para', ParaType.True, 'aa:para:1:2', 'aa', 'para:1:2', null],
        ['15.', ['repeat'], 'wait:sec', ParaType.True, 'repeat:wait:sec', 'repeat', 'wait:sec', null]
    ])(
        `%s: check key and para defKey: '%s', defQualifier: '%s', paraType '%p', key: '%s', expected key: '%s', expected para: '%s'. expected selector: '%s'`,
        (
            _: string,
            defKeys: Array<string>,
            defQualifier: string,
            paraType: ParaType,
            rowKey: string,
            expectedKey: string,
            expectedPara: string | null,
            expectedSelector: string | null
        ) => {
            const rowDefinitions = defKeys.map(
                (defKey) =>
                    new RowDefinition({
                        key: Symbol(defKey + (defQualifier ? ':' + defQualifier : '')),
                        parameterType: paraType,
                        selectorType: SelectorType.Optional,
                        type: TableRowType.PostProcessing,
                        executionUnit: null,
                        validators: null
                    })
            );

            const rawRows = [{ key: rowKey, ast: null, values: { value1: 'b' }, values_replaced: { value1: 'b' } }];

            const sut = new RowDefinitionBinder<any, RowWithOneValue>(metaInfo.tableName, metaInfo, rowDefinitions, rawRows);
            const rows = sut.bind(RowWithOneValue);

            expect(rows).toBeDefined();
            expect(rows).toHaveLength(1);

            const firstRow = rows[0];
            expect(firstRow).toBeDefined();
            expect(expectedKey).toBe(firstRow.action);
            expect(expectedPara).toBe(firstRow.actionPara);
            expect(expectedSelector).toBe(firstRow.data.ast.selectors?.match ?? null);
            expect(firstRow.value1).toBe('b');
        }
    );

    /**
     *
     */
    it.each([
        ['a1.', 'a:a', SelectorType.False, 'a:a#b', 'b', `'test-table': key 'a:a#b' cannot have a selector: 'b'!`],
        ['a2.', 'a:a', SelectorType.True, 'a:a#b', 'b', null],
        ['a3.', 'a:a', SelectorType.Optional, 'a:a#b', 'b', null],
        ['a4.', 'a:a', SelectorType.False, 'a:a:b#c', 'c', `'test-table': key 'a:a:b#c' cannot have a selector: 'c'!`],
        ['a5.', 'a:a', SelectorType.True, 'a:a:b#c', 'c', null],
        ['a6.', 'a:a', SelectorType.Optional, 'a:a:b#c', 'c', null]
    ])(
        `%s: check selector: '%s', selectorType '%p', key: '%s', expected selector: '%s'`,
        (_: string, defKey: string, selectorType: SelectorType, rowKey: string, expectedSelector: string, expectedErrorMessage: string) => {
            const rowDefinitions = [
                new RowDefinition({
                    key: Symbol(defKey),
                    parameterType: ParaType.Optional,
                    selectorType: selectorType,
                    type: TableRowType.PostProcessing,
                    executionUnit: null,
                    validators: null
                })
            ];
            const rawRows = [{ key: rowKey, ast: null, values: { value1: 'b' }, values_replaced: { value1: 'b' } }];

            const sut = new RowDefinitionBinder<any, RowWithOneValue>(metaInfo.tableName, metaInfo, rowDefinitions, rawRows);
            if (!!expectedErrorMessage) {
                expect(() => sut.bind(RowWithOneValue)).toThrow(expectedErrorMessage);
            } else {
                const rows = sut.bind(RowWithOneValue);
                expect(rows).toBeDefined();
                expect(rows).toHaveLength(1);
                expect(rows[0]).toBeDefined();
                expect(rows[0].data.ast.selectors?.match).toBe(expectedSelector);
            }
        }
    );

    /**
     *
     */
    it.each([
        ['b1.', 'a:a', ParaType.False, 'a:a:para', "'test-table': key 'a:a:para' with definition 'a:a' cannot have a parameter: 'para'!"],
        ['b2.', 'a:a', ParaType.False, 'aa', `'test-table': key 'aa' is not valid`],
        ['b3.', 'aa', ParaType.True, 'aa', `'test-table': key 'aa' must have a parameter!`]
    ])(
        `%s: check error for key and para (defKey: '%s', paraType: '%p', key: '%s', expected key: '%s', expected para: '%s'`,
        (_: string, defKey: string, paraType: ParaType, rowKey: string, expectedErrorMessage: string) => {
            const rowDefinitions = [
                new RowDefinition({
                    key: Symbol(defKey),
                    parameterType: paraType,
                    type: TableRowType.PostProcessing,
                    executionUnit: null,
                    validators: null
                })
            ];

            const rawRows = [{ key: rowKey, ast: null, values: { value1: 'b' }, values_replaced: { value1: 'b' } }];
            const sut = new RowDefinitionBinder<any, RowWithOneValue>(metaInfo.tableName, metaInfo, rowDefinitions, rawRows);

            expect(() => sut.bind(RowWithOneValue)).toThrow(expectedErrorMessage);
        }
    );
});

/**
 *
 */
describe('check binding with multiple definitions', () => {
    /**
     *
     */
    it('use multiple definitions', () => {
        /**
         *
         */
        class MockExecutionUnit implements ExecutionUnit<any, any> {
            constructor(description: string) {
                this.description = {
                    id: null,
                    title: description,
                    description,
                    examples: null
                };
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            execute(_context, _row): void {
                // do noting in mock
            }
            readonly description = null;
            get key() {
                return Symbol(this.description.title);
            }
        }

        const rowDefinitions = [
            new RowDefinition({
                key: Symbol('a1'),
                type: TableRowType.PostProcessing,
                executionUnit: new MockExecutionUnit('unit1'),
                validators: null
            }),
            new RowDefinition({
                key: Symbol('a2'),
                type: TableRowType.PostProcessing,
                executionUnit: new MockExecutionUnit('unit2'),
                validators: null
            }),
            new RowDefinition({
                key: Symbol('a3'),
                type: TableRowType.PostProcessing,
                executionUnit: new MockExecutionUnit('unit3'),
                validators: null
            })
        ];

        const rawRows = [{ key: 'a2', ast: null, values: { value1: 'b2' }, values_replaced: { value1: 'b2' } }];
        const sut = new RowDefinitionBinder<any, RowWithOneValue>(metaInfo.tableName, metaInfo, rowDefinitions, rawRows);
        const boundRows = sut.bind(RowWithOneValue);

        expect(boundRows).toBeDefined();
        expect(boundRows).toBeArrayOfSize(1);

        const rowWithDef = boundRows.find((def) => def.action === 'a2');

        expect(rowWithDef?.value1).toBe('b2');
        expect(DescriptionHandler.solve(rowWithDef?.data._metaDefinition.executionUnit.description).description).toBe('unit2');
    });

    /**
     *
     */
    it.each([
        ['01.', 'aa', ParaType.False, 'aa', 'aa', null, null],
        ['02.', 'aa', ParaType.True, 'aa:para1', 'aa', 'para1', null],
        ['03.', 'aa', ParaType.False, 'aa:para1', 'aa', 'para1', null],
        ['04.', 'aa', ParaType.Optional, 'aa:para3', 'aa', 'para3', null],
        ['05.', 'aa', ParaType.True, 'aa:para1#selector', 'aa', 'para1', 'selector'],
        ['06.', 'aa', ParaType.Optional, 'aa:para3#selector', 'aa', 'para3', 'selector'],
        ['07.', 'aa:para:1:2', ParaType.Optional, 'aa:para:1:2:3', 'aa', 'para:1:2:3', null]
    ])(
        `%s use multiple rows and multiple definitions => check key and para defKey: '%s', paraType '%p', key: '%s', expected key: '%s', expected para: '%s'. expected selector: '%s'`,
        (
            _: string,
            defKey: string,
            paraType: ParaType,
            rowKey: string,
            expectedKey: string,
            expectedPara: string | null,
            expectedSelector: string | null
        ) => {
            const rowDefinitions = [
                new RowDefinition({
                    key: Symbol('aa:para1'),
                    parameterType: ParaType.False,
                    selectorType: SelectorType.Optional,
                    type: TableRowType.PostProcessing,
                    executionUnit: null,
                    validators: null
                }),
                new RowDefinition({
                    key: Symbol(defKey),
                    parameterType: paraType,
                    selectorType: SelectorType.Optional,
                    type: TableRowType.PostProcessing,
                    executionUnit: null,
                    validators: null
                }),
                new RowDefinition({
                    key: Symbol('aa:para:2'),
                    parameterType: ParaType.Optional,
                    selectorType: SelectorType.Optional,
                    type: TableRowType.PostProcessing,
                    executionUnit: null,
                    validators: null
                }),
                new RowDefinition({
                    key: Symbol('aa:para:1'),
                    parameterType: ParaType.Optional,
                    selectorType: SelectorType.Optional,
                    type: TableRowType.PostProcessing,
                    executionUnit: null,
                    validators: null
                })
            ];

            const rawRows = [
                { key: rowKey, ast: null, values: { value1: 'b' }, values_replaced: { value1: 'b' } },
                { key: 'aa:para1', ast: null, values: { value1: 'b1' }, values_replaced: { value1: 'b1' } },
                { key: 'aa:para:1', ast: null, values: { value1: 'b:1' }, values_replaced: { value1: 'b:1' } },
                { key: 'aa:para:2', ast: null, values: { value1: 'b:2' }, values_replaced: { value1: 'b:2' } }
            ];

            const sut = new RowDefinitionBinder<any, RowWithOneValue>(metaInfo.tableName, metaInfo, rowDefinitions, rawRows);
            const rows = sut.bind(RowWithOneValue);

            expect(rows).toBeDefined();
            expect(rows).toHaveLength(4);
            expect(rows[0]).toBeDefined();
            expect(rows[0].action).toBe(expectedKey);
            expect(rows[0].actionPara).toBe(expectedPara);
            expect(rows[0].data.ast.selectors?.match ?? null).toBe(expectedSelector);
            expect(rows[0].value1).toBe('b');
        }
    );
});

/**
 *
 */
describe('check default value', () => {
    /**
     *
     */
    it.each([
        ['1.', 'b', null, null, 'b'],
        ['2.', 'b', 'c', Symbol('value1'), 'b']
    ])(
        `%s: check default (key defined, but no value) (rowValue: '%s', defaultValue: '%p', defaultValueColumn: '%s', expected key: '%s'`,
        (
            _nr: string,
            rowValue?: string | null,
            defaultValue?: string | null,
            defaultValueColumn?: symbol | null,
            expectedValue?: string | null
        ) => {
            const rowDefinitions = [
                new RowDefinition({
                    key: Symbol('a:a'),
                    parameterType: ParaType.False,
                    type: TableRowType.PostProcessing,
                    defaultValue,
                    defaultValueColumn,
                    executionUnit: null,
                    validators: null
                })
            ];
            const rawRows = [{ key: 'a:a', ast: null, values: { value1: rowValue }, values_replaced: { value1: rowValue } }];

            const sut = new RowDefinitionBinder<any, RowWithOneValue>(metaInfo.tableName, metaInfo, rowDefinitions, rawRows);
            const rows = sut.bind(RowWithOneValue);
            expect(rows[0].value1).toBe(expectedValue);
        }
    );

    /**
     *
     */
    it.each([
        ['1.', 'b', null, null, 'b'],
        ['2.', 'b', 'c', Symbol('value1'), 'b']
    ])(
        `%s: check default-structured (key defined, but no value) (rowValue: '%s', defaultValue: '%p', defaultValueColumn: '%s', expected key: '%s'`,
        (
            _nr: string,
            rowValue?: string | null,
            defaultValue?: string | null,
            defaultValueColumn?: symbol | null,
            expectedValue?: string | null
        ) => {
            const rowDefinitions = [
                new RowDefinition({
                    key: Symbol('a:a'),
                    parameterType: ParaType.False,
                    type: TableRowType.PostProcessing,
                    default: {
                        column: defaultValueColumn?.description as never,
                        value: defaultValue
                    },
                    executionUnit: null,
                    validators: null
                })
            ];
            const rawRows = [{ key: 'a:a', ast: null, values: { value1: rowValue }, values_replaced: { value1: rowValue } }];

            const sut = new RowDefinitionBinder<any, RowWithOneValue>(metaInfo.tableName, metaInfo, rowDefinitions, rawRows);
            const rows = sut.bind(RowWithOneValue);
            expect(rows[0].value1).toBe(expectedValue);
        }
    );

    /**
     *
     */
    it('check wrong default value column', () => {
        const rowDefinitions = [
            new RowDefinition({
                key: Symbol('a:a'),
                parameterType: ParaType.False,
                type: TableRowType.PostProcessing,
                defaultValue: 'b',
                defaultValueColumn: Symbol('wrong'),
                executionUnit: null,
                validators: null
            })
        ];

        const rawRows = [{ key: 'a:a', ast: null, values: { value1: 'b' }, values_replaced: { value1: 'b' } }];
        const sut = new RowDefinitionBinder<any, RowWithOneValue>(metaInfo.tableName, metaInfo, rowDefinitions, rawRows);

        expect(() => sut.bind(RowWithOneValue)).toThrow(`'test-table': default column name 'wrong' does not exists`);
    });

    /**
     *
     */
    it('check two definitions without paras', () => {
        const rowDefinitions = [
            new RowDefinition({
                key: Symbol('a:a'),
                parameterType: ParaType.Optional,
                type: TableRowType.PostProcessing,
                defaultValue: 'c',
                defaultValueColumn: Symbol('value1'),
                executionUnit: null,
                validators: null
            }),
            new RowDefinition({
                key: Symbol('a:b'),
                parameterType: ParaType.Optional,
                type: TableRowType.PostProcessing,
                defaultValue: 'd',
                defaultValueColumn: Symbol('value1'),
                executionUnit: null,
                validators: null
            })
        ];

        const rawRows = [{ key: 'a:a', ast: null, values: { value1: 'b' }, values_replaced: { value1: 'b' } }];
        const sut = new RowDefinitionBinder<any, RowWithOneValue>(metaInfo.tableName, metaInfo, rowDefinitions, rawRows);

        const rows = sut.bind(RowWithOneValue);
        expect(rows).toBeDefined();

        expect(rows[0].action).toBe('a');
        expect(rows[0].value1).toBe('d');
        expect(rows[0].actionPara).toBe('b');

        expect(rows[1].action).toBe('a');
        expect(rows[1].value1).toBe('b');
        expect(rows[1].actionPara).toBe('a');
    });

    /**
     *
     */
    it('check two definitions with paras', () => {
        const rowDefinitions = [
            new RowDefinition({
                key: Symbol('a:a'),
                parameterType: ParaType.Optional,
                type: TableRowType.PostProcessing,
                defaultValue: 'c',
                defaultValueColumn: Symbol('value1'),
                executionUnit: null,
                validators: null
            }),
            new RowDefinition({
                key: Symbol('a:b'),
                parameterType: ParaType.Optional,
                type: TableRowType.PostProcessing,
                defaultValue: 'd',
                defaultValueColumn: Symbol('value1'),
                executionUnit: null,
                validators: null
            })
        ];

        const rawRows = [{ key: 'a:a:para1', ast: null, values: { value1: 'b' }, values_replaced: { value1: 'b' } }];
        const sut = new RowDefinitionBinder<any, RowWithOneValue>(metaInfo.tableName, metaInfo, rowDefinitions, rawRows);

        const rows = sut.bind(RowWithOneValue);
        expect(rows).toBeDefined();

        expect(rows[0].action).toBe('a');
        expect(rows[0].value1).toBe('d');
        expect(rows[0].actionPara).toBe('b');

        expect(rows[1].action).toBe('a');
        expect(rows[1].value1).toBe('b');
        expect(rows[1].actionPara).toBe('a:para1');
    });
});
