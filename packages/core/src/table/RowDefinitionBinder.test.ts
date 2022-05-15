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
        return this.data.key;
    }

    get actionPara() {
        return this.data.keyPara;
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
            key: Symbol('a:a'),
            type: TableRowType.PostProcessing,
            executionUnit: null,
            validators: null
        })
    ];
    const rawRows = [{ key: 'a:a', values: { value1: 'b' }, values_replaced: { value1: 'b' } }];

    const sut = new RowDefinitionBinder<any, RowWithOneValue>(metaInfo.tableName, metaInfo, rowDefinitions, rawRows);
    const rows: RowWithOneValue[] = sut.bind(RowWithOneValue);

    expect(rows).toBeDefined();
    expect(rows).toBeInstanceOf(Array);
    expect(rows.length).toBe(1);
    expect(rows[0].action).toBe('a:a');
    expect(rows[0].actionPara).toBeNull();
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
        ['01.', 'a:a', ParaType.False, 'a:a', 'a:a', null, null],
        ['02.', 'a:a', ParaType.Optional, 'a:a', 'a:a', null, null],
        ['03.', 'a:a', ParaType.Optional, 'a:a:para', 'a:a', 'para', null],
        ['04.', 'a-a', ParaType.Optional, 'a-a:para', 'a-a', 'para', null],
        ['05.', 'a:a', ParaType.True, 'a:a:para', 'a:a', 'para', null],
        ['06.', 'a:a', ParaType.True, 'a:a:para:1', 'a:a', 'para:1', null],
        ['07.', 'a:a', ParaType.Optional, 'a:a:para:1', 'a:a', 'para:1', null],
        ['08.', 'a:a', ParaType.Optional, 'a:a:para:1#s1', 'a:a', 'para:1', 's1'],
        ['09.', 'a:a', ParaType.Optional, 'a:a:para#s1', 'a:a', 'para', 's1'],
        ['10.', 'a:a', ParaType.Optional, 'a:a#s1', 'a:a', null, 's1']
    ])(
        `%s: check key and para defKey: '%s', paraType '%p', key: '%s', expected key: '%s', expected para: '%s'. expected selector: '%s'`,
        (
            _: string,
            defKey: string,
            paraType: ParaType,
            rowKey: string,
            expectedKey: string,
            expectedPara: string,
            expectedSelector: string
        ) => {
            const rowDefinitions = [
                new RowDefinition({
                    key: Symbol(defKey),
                    parameterType: paraType,
                    selectorType: SelectorType.Optional,
                    type: TableRowType.PostProcessing,
                    executionUnit: null,
                    validators: null
                })
            ];
            const rawRows = [{ key: rowKey, values: { value1: 'b' }, values_replaced: { value1: 'b' } }];

            const sut = new RowDefinitionBinder<any, RowWithOneValue>(metaInfo.tableName, metaInfo, rowDefinitions, rawRows);
            const rows = sut.bind(RowWithOneValue);

            expect(rows).toBeDefined();
            expect(rows.length).toBe(1);
            expect(rows[0]).toBeDefined();
            expect(rows[0].action).toBe(expectedKey);
            expect(rows[0].actionPara).toBe(expectedPara);
            expect(rows[0].data.selector).toBe(expectedSelector);
            expect(rows[0].value1).toBe('b');
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
            const rawRows = [{ key: rowKey, values: { value1: 'b' }, values_replaced: { value1: 'b' } }];

            const sut = new RowDefinitionBinder<any, RowWithOneValue>(metaInfo.tableName, metaInfo, rowDefinitions, rawRows);
            if (!!expectedErrorMessage) {
                expect(() => sut.bind(RowWithOneValue)).toThrowError(expectedErrorMessage);
            } else {
                const rows = sut.bind(RowWithOneValue);
                expect(rows).toBeDefined();
                expect(rows.length).toBe(1);
                expect(rows[0]).toBeDefined();
                expect(rows[0].data.selector).toBe(expectedSelector);
            }
        }
    );

    /**
     *
     */
    it.each([
        ['b1.', 'a:a', ParaType.False, 'a:a:para', `'test-table': key 'a:a:para' cannot have a parameter: 'para'!`],
        ['b2.', 'a:a', ParaType.False, 'aa', `'test-table': key 'aa' is not valid`],
        ['b3.', 'a:a', ParaType.True, 'a:a', `'test-table': key 'a:a' must have a parameter!`]
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

            const rawRows = [{ key: rowKey, values: { value1: 'b' }, values_replaced: { value1: 'b' } }];
            const sut = new RowDefinitionBinder<any, RowWithOneValue>(metaInfo.tableName, metaInfo, rowDefinitions, rawRows);

            expect(() => sut.bind(RowWithOneValue)).toThrowError(expectedErrorMessage);
            try {
                sut.bind(RowWithOneValue);
            } catch (error) {
                expect(error.message).toBe(expectedErrorMessage);
                return;
            }

            throw Error(`paraType:false with parameter must throw an error`);
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
        ['b', null, null, 'b'],
        ['b', 'c', Symbol('value1'), 'b'],
        [null, 'c', Symbol('value1'), 'c'],
        ['', 'c', Symbol('value1'), 'c']
    ])(
        `check key and para (defKey: '%s', paraType: '%p', key: '%s', expected key: '%s', expected para: '%s'`,
        (rowValue: string, defaultValue: string, defaultValueColumn: symbol, expectedValue: string) => {
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
            const rawRows = [{ key: 'a:a', values: { value1: rowValue }, values_replaced: { value1: rowValue } }];

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

        const rawRows = [{ key: 'a:a', values: { value1: 'b' }, values_replaced: { value1: 'b' } }];
        const sut = new RowDefinitionBinder<any, RowWithOneValue>(metaInfo.tableName, metaInfo, rowDefinitions, rawRows);

        try {
            sut.bind(RowWithOneValue);
        } catch (error) {
            expect(error.message).toBe(`'test-table': default column name 'wrong' does not exists`);
            return;
        }

        throw Error(`paraType:false with parameter must throw an error`);
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
                executionUnit: null,
                validators: null
            }),
            new RowDefinition({
                key: Symbol('a:b'),
                parameterType: ParaType.Optional,
                type: TableRowType.PostProcessing,
                defaultValue: 'd',
                executionUnit: null,
                validators: null
            })
        ];

        const rawRows = [{ key: 'a:a', values: { value1: 'b' }, values_replaced: { value1: 'b' } }];
        const sut = new RowDefinitionBinder<any, RowWithOneValue>(metaInfo.tableName, metaInfo, rowDefinitions, rawRows);

        const rows = sut.bind(RowWithOneValue);
        expect(rows).toBeDefined();
        expect(rows[0].action).toBe('a:a');
        expect(rows[0].value1).toBe('b');
        expect(rows[0].actionPara).toBeNull();
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
                executionUnit: null,
                validators: null
            }),
            new RowDefinition({
                key: Symbol('a:b'),
                parameterType: ParaType.Optional,
                type: TableRowType.PostProcessing,
                defaultValue: 'd',
                executionUnit: null,
                validators: null
            })
        ];

        const rawRows = [{ key: 'a:a:para1', values: { value1: 'b' }, values_replaced: { value1: 'b' } }];
        const sut = new RowDefinitionBinder<any, RowWithOneValue>(metaInfo.tableName, metaInfo, rowDefinitions, rawRows);

        const rows = sut.bind(RowWithOneValue);
        expect(rows).toBeDefined();
        expect(rows[0].action).toBe('a:a');
        expect(rows[0].value1).toBe('b');
        expect(rows[0].actionPara).toBe('para1');
    });
});
