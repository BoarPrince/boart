import { VariableParser } from '../parser/VariableParser';
import { SelectorArray } from '../parser/ast/SelectorArray';
import { SelectorType } from '../parser/ast/SelectorType';

import { ContentType } from './ContentType';
import { DataContentHelper } from './DataContentHelper';
import { NativeContent } from './NativeContent';
import { NullContent } from './NullContent';
import { ObjectContent } from './ObjectContent';
import { SelectorExtractor } from './SelectorExtractor';
import { TextContent } from './TextContent';

/**
 *
 */
const pegParser = new VariableParser();

/**
 *
 */
const createSelector = (valueOrIndex: string, type = SelectorType.SIMPLE, value: string = null, optional = false) => ({
    type,
    value: value ?? valueOrIndex,
    index: Number.parseInt(valueOrIndex),
    optional
});

/**
 *
 */
describe('deep getting simple', () => {
    /**
     *
     */
    it('deep get property - object - leaf', () => {
        const val = new ObjectContent({
            a: {
                b: {
                    c: {
                        d: 'e'
                    }
                }
            }
        });
        const propValue = SelectorExtractor.getValueBySelector(
            [
                createSelector('a'), //
                createSelector('b'),
                createSelector('c'),
                createSelector('d')
            ],
            val
        );
        expect(propValue.toString()).toBe('e');
    });

    /**
     *
     */
    it('deep get property - native object - leaf', () => {
        const val = {
            a: {
                b: {
                    c: {
                        d: 'e'
                    }
                }
            }
        };
        const propValue = SelectorExtractor.getValueBySelector(
            [
                createSelector('a'), //
                createSelector('b'),
                createSelector('c'),
                createSelector('d')
            ],
            val
        );
        expect(propValue.toString()).toBe('e');
    });

    /**
     *
     */
    it('deep get property - object - root', () => {
        const val = new ObjectContent({
            a: {
                b: {
                    c: {
                        d: 'e'
                    }
                }
            }
        });
        const propValue = SelectorExtractor.getValueBySelector([createSelector('a')], val);
        expect(propValue.toString()).toBe('{"b":{"c":{"d":"e"}}}');
    });

    /**
     *
     */
    it('deep get property - object - multiple keys', () => {
        const val = new ObjectContent({
            a: {
                b: {
                    c: {
                        d: 'e'
                    }
                }
            }
        });
        const propValue = SelectorExtractor.getValueBySelector(
            [
                createSelector('a'), //
                createSelector('b'),
                createSelector('c')
            ],
            val
        );
        expect(propValue.toString()).toBe('{"d":"e"}');
    });

    /**
     *
     */
    it('deep get property - object - multiple keys - datacontent', () => {
        const val = new ObjectContent({
            a: {
                b: new ObjectContent({
                    c: new ObjectContent({
                        d: 'e'
                    })
                })
            }
        });
        const propValue = SelectorExtractor.getValueBySelector(
            [
                createSelector('a'), //
                createSelector('b'),
                createSelector('c')
            ],
            val
        );
        expect(propValue.toString()).toBe('{"d":"e"}');
    });

    /**
     *
     */
    it('deep get property - start with array index - 1', () => {
        const val = new ObjectContent([{ a: [3, 4] }]);
        const selectors = pegParser.parseAction('test#[0].a[1]').selectors;
        const sut = SelectorExtractor.getValueBySelector(selectors, val);

        expect(sut.valueOf()).toBe(4);
    });

    /**
     *
     */
    it('get deep property string from object value', () => {
        const val = new ObjectContent('{"a": "b", "c": 1, "d": {"e": "f"}}');

        const propValue1 = SelectorExtractor.getValueBySelector([createSelector('d')], val);
        const propValue = SelectorExtractor.getValueBySelector([createSelector('e')], propValue1);

        expect(propValue).toBeInstanceOf(TextContent);
        expect(propValue.toString()).toBe('f');
    });

    /**
     *
     */
    it('get deep property with array (first level)', () => {
        const val = new ObjectContent({ a: [{ b: 'c' }, { d: 'e' }] });

        const propValue = SelectorExtractor.getValueBySelector(
            [
                createSelector('a'), //
                createSelector('0'),
                createSelector('b')
            ],
            val
        );

        expect(propValue).toBeInstanceOf(TextContent);
        expect(propValue.toString()).toBe('c');
    });

    /**
     *
     */
    it('get deep property with array (second level)', () => {
        const val = new ObjectContent({ a: [{ b: 'c' }, { d: ['e', 7] }] });

        const propValue = SelectorExtractor.getValueBySelector(
            [
                createSelector('a'), //
                createSelector('1'),
                createSelector('d'),
                createSelector('1')
            ],
            val
        );

        expect(propValue).toBeInstanceOf(NativeContent);
        expect(propValue.toString()).toBe('7');
    });

    /**
     *
     */
    it('get deep property with array (second level, array syntax)', () => {
        const val = new ObjectContent({ a: [{ b: 'c' }, { d: ['e', 7] }] });
        const selectors = pegParser.parseAction('test#a[1].d[1]').selectors;

        const propValue = SelectorExtractor.getValueBySelector(selectors, val);

        expect(propValue).toBeInstanceOf(NativeContent);
        expect(propValue.toString()).toBe('7');
    });

    /**
     *
     */
    it('get deep property with array (two levels, array syntax)', () => {
        const val = new ObjectContent({ a: [{ b: 'c' }, ['e', 7]] });
        const selectors = pegParser.parseAction('test#a[1][1]').selectors;

        const propValue = SelectorExtractor.getValueBySelector(selectors, val);

        expect(propValue).toBeInstanceOf(NativeContent);
        expect(propValue.toString()).toBe('7');
    });

    /**
     *
     */
    it('get deep property with array (starting with array, array syntax)', () => {
        const val = new ObjectContent(['a', ['b', { c: 7 }]]);
        const selectors = pegParser.parseAction('test#[1][1].c').selectors;

        const propValue = SelectorExtractor.getValueBySelector(selectors, val);

        expect(propValue).toBeInstanceOf(NativeContent);
        expect(propValue.toString()).toBe('7');
    });

    /**
     *
     */
    it('get deep property from string', () => {
        const val = new ObjectContent('a');

        const selector: SelectorArray = [createSelector('z')];
        selector.match = 'z';

        expect(() => {
            SelectorExtractor.getValueBySelector(selector, val);
        }).toThrow('getting "z" not possible, because "z" is not an object or an array.\nData context:\n"a"');
    });

    /**
     *
     */
    it('get deep but property does not exists (1)', () => {
        const val = new ObjectContent('{"a": "b"}');

        const selector: SelectorArray = [
            createSelector('a'), //
            createSelector('c')
        ];
        selector.match = 'a.c';

        expect(() => {
            SelectorExtractor.getValueBySelector(selector, val);
        }).toThrow('getting "a.c" not possible, because "c" is not an object or an array.\nData context:\n"b"');
    });

    /**
     *
     */
    it('get deep but property does not exists (2)', () => {
        const val = new ObjectContent('{"a": "b"}');

        const selector: SelectorArray = [createSelector('z')];
        selector.match = 'z';

        const errorMsg = `getting "z" not possible, because "z" is not an object or an array.\nData context:\n${JSON.stringify(
            val.valueOf(),
            null,
            '  '
        )}`;

        expect(() => SelectorExtractor.getValueBySelector(selector, val)).toThrow(errorMsg);
    });

    /**
     *
     */
    it('get deep property from object value (wrong path, second element)', () => {
        const val = new ObjectContent('{"a": "b", "c": 1, "d": {"e": "f"}}');
        const propValue = SelectorExtractor.getValueBySelector([createSelector('d')], val);

        const selector: SelectorArray = [createSelector('z')];
        selector.match = 'z';

        const errorMsg = `getting "z" not possible, because "z" is not an object or an array.\nData context:\n${JSON.stringify(
            propValue.valueOf(),
            null,
            '  '
        )}`;
        expect(() => SelectorExtractor.getValueBySelector(selector, propValue)).toThrow(errorMsg);
    });

    /**
     *
     */
    it('get deep property from object value (wrong path, first element)', () => {
        const val = new ObjectContent('{"a": "b", "c": 1, "d": {"e": "f"}}');

        const selector: SelectorArray = [createSelector('z')];
        selector.match = 'z';

        const errorMsg = `getting "z" not possible, because "z" is not an object or an array.\nData context:\n${JSON.stringify(
            val.valueOf(),
            null,
            '  '
        )}`;
        expect(() => SelectorExtractor.getValueBySelector(selector, val)).toThrow(errorMsg);
    });

    /**
     *
     */
    it('get deep property from recursice containing ObjectContents', () => {
        const val = new ObjectContent({ a: new ObjectContent({ b: new ObjectContent({ c: new TextContent('d') }) }) });

        const propValue = SelectorExtractor.getValueBySelector(
            [
                createSelector('a'), //
                createSelector('b'),
                createSelector('c')
            ],
            val
        );

        expect(propValue).toBeInstanceOf(TextContent);
        expect(propValue.toString()).toBe('d');
    });

    /**
     *
     */
    it('try getting value from none DataContent', () => {
        const data = new TextContent('abc');

        const selector: SelectorArray = [
            createSelector('a'), //
            createSelector('b')
        ];
        selector.match = 'a.b';

        expect(() => SelectorExtractor.getValueBySelector(selector, data)).toThrow(
            `getting "a.b" not possible, because "a" is not an object or an array.\nData context:\n"abc"`
        );
    });

    /**
     *
     */
    it('try getting with wrong path', () => {
        const data = new ObjectContent({ a: { b: 'c' } });
        try {
            DataContentHelper.getByPath('a.c', data);
        } catch (error) {
            expect(error.message).toBe(
                `getting "a.c" not possible, because "c" is not an object or an array.\nData context:\n${JSON.stringify(
                    { b: 'c' },
                    null,
                    '  '
                )}`
            );
            return;
        }
        fail('expection was not thrown');
    });

    /**
     *
     */
    it('try getting null value', () => {
        const result = DataContentHelper.getByPath('a.b', new ObjectContent({ a: { b: null } }));
        expect(result).toBeInstanceOf(NullContent);
    });

    /**
     *
     */
    it('try getting null value - deep', () => {
        const data = new ObjectContent({ a: { b: null } });

        expect(() => DataContentHelper.getByPath('a.b.c', data)).toThrowError(
            'getting "a.b.c" not possible, because "c" is not an object or an array.'
        );
    });

    /**
     *
     */
    it('check if content data is null', () => {
        try {
            DataContentHelper.getByPath('a.b.c', null);
        } catch (error) {
            expect(error.message).toBe('getting "a.b.c" not possible, because "a" is not an object or an array.');
            return;
        }
        fail('expection was not thrown');
    });

    /**
     *
     */
    it('try get wrong path value', () => {
        const data = new ObjectContent({ a: { b: new ObjectContent({ c: 'd' }) } });
        try {
            DataContentHelper.getByPath('a.b.d', data);
        } catch (error) {
            expect(error.message).toBe(
                `getting "a.b.d" not possible, because "d" is not an object or an array.\nData context:\n${JSON.stringify(
                    { c: 'd' },
                    null,
                    '  '
                )}`
            );
            return;
        }
        fail('expection was not thrown');
    });
});

/**
 *
 */
describe('deep has', () => {
    /**
     *
     */
    it('deep has property (object) - leaf', () => {
        const val = new ObjectContent({
            a: {
                b: {
                    c: {
                        d: 'e'
                    }
                }
            }
        });

        const selector: SelectorArray = [
            createSelector('a'), //
            createSelector('b'),
            createSelector('c'),
            createSelector('d')
        ];

        const result = SelectorExtractor.hasValueBySelector(selector, val);
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('deep has property (object) - root', () => {
        const val = new ObjectContent({
            a: {
                b: {
                    c: {
                        d: 'e'
                    }
                }
            }
        });
        const result = DataContentHelper.hasPath('a', val);
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('deep has property (object) - multiple keys', () => {
        const val = new ObjectContent({
            a: {
                b: {
                    c: {
                        d: 'e'
                    }
                }
            }
        });
        const result = DataContentHelper.getByPath('a.b.c', val);
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('deep has property (object) - multiple keys - datacontent', () => {
        const val = new ObjectContent({
            a: {
                b: new ObjectContent({
                    c: new ObjectContent({
                        d: 'e'
                    })
                })
            }
        });
        const result = DataContentHelper.getByPath('a.b.c', val);
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('has deep property (string) from object value', () => {
        const val = new ObjectContent('{"a": "b", "c": 1, "d": {"e": "f"}}');
        const propValue = DataContentHelper.getByPath('d', val);
        const result = DataContentHelper.hasPath('e', propValue);

        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('has deep property with array (first level)', () => {
        const val = new ObjectContent({ a: [{ b: 'c' }, { d: 'e' }] });
        const result = DataContentHelper.hasPath('a.0.b', val);

        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('has deep property with array (second level)', () => {
        const val = new ObjectContent({ a: [{ b: 'c' }, { d: ['e', 7] }] });
        const result = DataContentHelper.hasPath('a.1.d.1', val);

        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('has deep property with array (second level, array syntax)', () => {
        const val = new ObjectContent({ a: [{ b: 'c' }, { d: ['e', 7] }] });
        const result = DataContentHelper.hasPath('a[1].d[1]', val);

        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('has deep property with array (two levels, array syntax)', () => {
        const val = new ObjectContent({ a: [{ b: 'c' }, ['e', 7]] });
        const result = DataContentHelper.hasPath('a[1][1]', val);

        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('has deep property with array (starting with array, array syntax)', () => {
        const val = new ObjectContent(['a', ['b', { c: 7 }]]);
        const result = DataContentHelper.hasPath('[1][1].c', val);

        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('has deep property from string', () => {
        const val = new ObjectContent('a');

        const result = DataContentHelper.hasPath('z', val);
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('has deep but property does not exists (1)', () => {
        const val = new ObjectContent('{"a": "b"}');

        const result = DataContentHelper.hasPath('a.c', val);
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('has deep but property does not exists (2)', () => {
        const val = new ObjectContent('{"a": "b"}');

        const result = DataContentHelper.hasPath('z', val);
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('has deep property from object value (wrong path, second element)', () => {
        const val = new ObjectContent('{"a": "b", "c": 1, "d": {"e": "f"}}');
        const propValue = DataContentHelper.getByPath('d', val);

        const result = DataContentHelper.hasPath('z', propValue);
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('has deep property from object value (wrong path, first element)', () => {
        const val = new ObjectContent('{"a": "b", "c": 1, "d": {"e": "f"}}');

        const result = DataContentHelper.hasPath('z', val);
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('has deep property from recursice containing ObjectContents', () => {
        const val = new ObjectContent({ a: new ObjectContent({ b: new ObjectContent({ c: new TextContent('d') }) }) });
        const result = DataContentHelper.hasPath('a.b.c', val);

        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check getting value from none DataContent', () => {
        const data = new TextContent('abc');
        const result = DataContentHelper.hasPath('a.b', data);

        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check getting with wrong path', () => {
        const data = new ObjectContent({ a: { b: 'c' } });
        const result = DataContentHelper.hasPath('a.c', data);

        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check getting null value', () => {
        const result = DataContentHelper.hasPath('a.b', new ObjectContent({ a: { b: null } }));

        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check getting undefined value', () => {
        const result = DataContentHelper.hasPath('a.b', new ObjectContent({ a: { b: undefined } }));

        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check getting null value - deep', () => {
        const data = new ObjectContent({ a: { b: null } });
        const result = DataContentHelper.hasPath('a.b.c', data);

        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check if content data is null', () => {
        const result = DataContentHelper.hasPath('a.b.c', null);

        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check get wrong path value', () => {
        const data = new ObjectContent({ a: { b: new ObjectContent({ c: 'd' }) } });
        const result = DataContentHelper.hasPath('a.b.d', data);

        expect(result).toBeFalsy();
    });
});

/**
 *
 */
describe('deep setting', () => {
    /**
     *
     */
    it('set first level value (empty object)', () => {
        const sut = SelectorExtractor.setValueBySelector([createSelector('a')], 'a', new ObjectContent());
        expect(sut.valueOf()).toStrictEqual({ a: 'a' });
    });

    /**
     *
     */
    it('create array one dimensional (first level)', () => {
        const sut = SelectorExtractor.setValueBySelector([createSelector('0')], 'a', new ObjectContent());
        expect(sut.valueOf()).toStrictEqual(['a']);
    });

    /**
     *
     */
    it('set deep on new object', () => {
        const sut = SelectorExtractor.setValueBySelector(
            [
                createSelector('a'), //
                createSelector('b'),
                createSelector('c'),
                createSelector('d'),
                createSelector('e'),
                createSelector('f'),
                createSelector('g')
            ],
            'a',
            new ObjectContent()
        );

        expect(sut.valueOf()).toStrictEqual({ a: { b: { c: { d: { e: { f: { g: 'a' } } } } } } });
    });

    /**
     *
     */
    it('set deep on new object - with array - 1', () => {
        const selectors = pegParser.parseAction('test#[0].d').selectors;
        const sut = SelectorExtractor.setValueBySelector(selectors, 'a', new ObjectContent());

        const value = sut.valueOf();
        expect(value).toStrictEqual([{ d: 'a' }]);
    });

    /**
     *
     */
    it('set deep on new object - with array - 2', () => {
        const selectors = pegParser.parseAction('test#[1].d').selectors;
        const sut = SelectorExtractor.setValueBySelector(selectors, 'a', new ObjectContent());

        const value = sut.valueOf();
        // eslint-disable-next-line no-sparse-arrays
        expect(value).toStrictEqual([, { d: 'a' }]);
    });

    /**
     *
     */
    it('set deep on new object - with array - 3', () => {
        const selectors = pegParser.parseAction('test#a.b.c[0].d.e.f.g').selectors;
        const sut = SelectorExtractor.setValueBySelector(selectors, 'a', new ObjectContent());

        expect(sut.valueOf()).toStrictEqual({ a: { b: { c: [{ d: { e: { f: { g: 'a' } } } }] } } });
    });

    /**
     *
     */
    it('set path for text value', () => {
        const selectors = pegParser.parseAction('test#b.c[0]').selectors;
        expect(() => SelectorExtractor.setValueBySelector(selectors, 'a', new TextContent('b'))).toThrow(
            'getting "b.c[0]" not possible, because "b" is not an object or an array.\nData context:\n"b"'
        );
    });

    /**
     *
     */
    it.each([
        ['01', null, 'a', 'a', '{"a":"a"}'],
        ['02', undefined, 'a', 'a', '{"a":"a"}'],
        ['03', { a: 1 }, 'a', '[]', '{"a":[]}'],
        ['04', { a: 'b' }, 'a', 'a', '{"a":"a"}'],
        ['05', { b: 'b' }, 'a', 'a', '{"b":"b","a":"a"}'],
        ['06', { b: 'b' }, 'a.b', 'a', '{"b":"b","a":{"b":"a"}}'],
        ['07', { b: 'b' }, 'a.b', 'a', '{"b":"b","a":{"b":"a"}}'],
        ['08', { b: 'b' }, 'a.b.c', 'd', '{"b":"b","a":{"b":{"c":"d"}}}'],
        ['09', { b: [{ c: 'd' }, 'e', 5] }, 'b.0.c', 'a', '{"b":[{"c":"a"},"e",5]}'],
        ['10', 'b', 'b.c[0]', 'a', '{"b":{"c":["a"]}}'],
        ['11', 'b', 'b.c.0', 'a', '{"b":{"c":["a"]}}'],
        ['12', { b: { c: ['d', 'e', 5] } }, 'b.c.0', 'a', '{"b":{"c":["a","e",5]}}'],
        ['13', { b: { c: ['d', 'e', 5] } }, 'b.c[0]', 'a', '{"b":{"c":["a","e",5]}}']
    ])(
        `%s:, intial: %s, path: '%s', value: '%s', expected: %s`,
        (_: string, initialContent: ContentType, selector: string, value: ContentType, expectedJSON: string) => {
            const selectors = pegParser.parseAction('test#' + selector).selectors;

            const sut = SelectorExtractor.setValueBySelector(selectors, value, new ObjectContent(initialContent));

            expect(sut.toJSON()).toBe(expectedJSON);
        }
    );

    /**
     *
     */
    it('set path two times', () => {
        const sut = SelectorExtractor.setValueBySelector(pegParser.parseAction('test#a').selectors, 'c', new ObjectContent({ a: 'b' }));
        expect(sut.toJSON()).toBe('{"a":"c"}');

        const sut2 = SelectorExtractor.setValueBySelector(pegParser.parseAction('test#a').selectors, 'd', sut);
        expect(sut2.toJSON()).toBe('{"a":"d"}');
    });

    /**
     *
     */
    it('try set deep structure to a none object', () => {
        const sut_content = SelectorExtractor.setValueBySelector(
            pegParser.parseAction('test#a').selectors,
            'a',
            new ObjectContent({ a: { b: 'c' } })
        );

        expect(() => SelectorExtractor.setValueBySelector(pegParser.parseAction('test#a.b.c').selectors, 'a', sut_content)).toThrow(
            'cannot set value to an \'Text\' value, selector: "a.b.c"'
        );
    });
});

/**
 *
 */
describe('wildcard', () => {
    /**
     *
     */
    it('only wildcard', () => {
        const selectors = pegParser.parseAction('test#a[*]').selectors;
        const sut = SelectorExtractor.getValueBySelector(selectors, new ObjectContent({ a: [{ b: 1 }, { b: 2 }] }));

        expect(sut.valueOf()).toStrictEqual([{ b: 1 }, { b: 2 }]);
    });

    /**
     *
     */
    fit('get first level', () => {
        const selectors = pegParser.parseAction('test#a[*].b').selectors;
        const val = new ObjectContent({ a: [{ b: 1 }, { b: 2 }] });
        const sut = SelectorExtractor.getValueBySelector(selectors, val);

        expect(sut.valueOf()).toStrictEqual([1, 2]);
    });

    /**
     *
     */
    it('get first level, when not all entries are collectable', () => {
        const val = new ObjectContent({ a: [{ b: 1 }, ['b', 2]] });
        const propValue = DataContentHelper.getByPath('a[*].b', val);

        expect(propValue.valueOf()).toEqual([1]);
    });

    /**
     *
     */
    it('wildcard selects a none array element', () => {
        const val = new ObjectContent({ a: [{ b: 1 }, { b: 2 }], b: { c: 3 } });

        expect(() => DataContentHelper.getByPath('b[*]', val)).toThrowError(
            'getting "b.*" not possible, because "*" is not an object or an array.\nData context:\n' +
                JSON.stringify(
                    {
                        c: 3
                    },
                    null,
                    '  '
                )
        );
    });

    /**
     *
     */
    it('get second level', () => {
        const val = new ObjectContent({ a: [{ b: [{ c: 3 }, { c: 4 }] }] });
        const propValue = DataContentHelper.getByPath('a[*].b[*].c', val);

        expect(propValue.valueOf()).toEqual([3, 4]);
    });

    /**
     *
     */
    it('get third level - one element', () => {
        const val = new ObjectContent({ a: [{ b: [{ c: { d: 5 } }, { c: 4 }] }] });
        const propValue = DataContentHelper.getByPath('a[*].b[*].c.d', val);

        expect(propValue.valueOf()).toEqual([5]);
    });

    /**
     *
     */
    it('get third level - more elements', () => {
        const val = new ObjectContent({ a: [{ b: [{ c: { d: 5 } }, { c: { d: 6 } }] }] });
        const propValue = DataContentHelper.getByPath('a[*].b[*].c.d', val);

        expect(propValue.valueOf()).toEqual([5, 6]);
    });

    /**
     *
     */
    it('get third level - array elements', () => {
        const val = new ObjectContent({ a: [{ b: [{ c: { d: [5, 6, 7] } }, { c: { d: [8, 9, 10] } }] }] });
        const propValue = DataContentHelper.getByPath('a[*].b[*].c.d', val);

        expect(propValue.valueOf()).toEqual([5, 6, 7, 8, 9, 10]);
    });

    /**
     *
     */
    it('at least one element must have a parameter', () => {
        const val = new ObjectContent({ a: [{ b: [{ c: { d: 5 } }, { c: 4 }] }] });

        expect(() => DataContentHelper.getByPath('a[*].b[*].d', val)).toThrowError(
            `getting "a.*.b.*.d" not possible, because "d" is not an object or an array.\nData context:\n` +
                JSON.stringify(
                    [
                        {
                            c: {
                                d: 5
                            }
                        },
                        {
                            c: 4
                        }
                    ],
                    null,
                    '  '
                )
        );
    });

    /**
     *
     */
    it(`no property fits, but it's optional`, () => {
        const val = new ObjectContent({ a: [{ b: [{ c: { d: 5 } }, { c: 4 }] }] });

        const propValue = DataContentHelper.getByPath('a[*].b[*].d?', val);

        expect(propValue.valueOf()).toBeInstanceOf(NullContent);
    });
});

/**
 *
 */
describe('null or undefined', () => {
    /**
     *
     */
    it('null', () => {
        const result = DataContentHelper.isNullOrUndefined(null);
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('null', () => {
        const result = DataContentHelper.isNullOrUndefined(null);
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('NullContent', () => {
        const result = DataContentHelper.isNullOrUndefined(new NullContent());
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('NativeContent - undefined', () => {
        const result = DataContentHelper.isNullOrUndefined(new NativeContent(undefined));
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('number', () => {
        const result = DataContentHelper.isNullOrUndefined(1);
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('NativeContent - number', () => {
        const result = DataContentHelper.isNullOrUndefined(new NativeContent(1));
        expect(result).toBeFalsy();
    });
});

/**
 *
 */
describe('toNative', () => {
    /**
     *
     */
    it('number', () => {
        const result = DataContentHelper.toNative(1);
        expect(result).toBe(1);
    });

    /**
     *
     */
    it('number as string', () => {
        const result = DataContentHelper.toNative('1');
        expect(result).toBe(1);
    });

    /**
     *
     */
    it('float', () => {
        const result = DataContentHelper.toNative(1.1);
        expect(result).toBe(1.1);
    });

    /**
     *
     */
    it('float as string', () => {
        const result = DataContentHelper.toNative('1.1');
        expect(result).toBe(1.1);
    });

    /**
     *
     */
    it('boolean - true', () => {
        const result = DataContentHelper.toNative(true);
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('boolean - false', () => {
        const result = DataContentHelper.toNative(false);
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('boolean as string - true', () => {
        const result = DataContentHelper.toNative('true');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('boolean as string - false', () => {
        const result = DataContentHelper.toNative('false');
        expect(result).toBeFalsy();
    });
});

/**
 *
 */
describe('create', () => {
    /**
     *
     */
    it('create with DataContent must the same', () => {
        const dataContent = new TextContent('a');
        const result = DataContentHelper.create(dataContent);

        expect(result === dataContent).toBeTruthy();
    });

    /**
     *
     */
    it('create with null', () => {
        const result = DataContentHelper.create(null);

        expect(result).toBeInstanceOf(NullContent);
    });

    /**
     *
     */
    it('create with null - string', () => {
        const result = DataContentHelper.create('null');

        expect(result).toBeInstanceOf(NullContent);
    });

    /**
     *
     */
    it('create with null - string - quoted', () => {
        const result = DataContentHelper.create('"null"');

        expect(result).toBeInstanceOf(TextContent);
        expect(result.getValue()).toBe('null');
    });

    /**
     *
     */
    it('create with undefined', () => {
        const result = DataContentHelper.create(undefined);

        expect(result).toBeInstanceOf(NativeContent);
        expect(result.getValue()).toBeUndefined();
    });

    /**
     *
     */
    it('create with undefined - string', () => {
        const result = DataContentHelper.create('undefined');

        expect(result).toBeInstanceOf(NativeContent);
        expect(result.getValue()).toBeUndefined();
    });

    /**
     *
     */
    it('create with undefined - string - quoted', () => {
        const result = DataContentHelper.create('"undefined"');

        expect(result).toBeInstanceOf(TextContent);
        expect(result.getValue()).toBe('undefined');
    });

    /**
     *
     */
    it('create number', () => {
        const result = DataContentHelper.create(1);

        expect(result).toBeInstanceOf(NativeContent);
        expect(result.getValue()).toBe(1);
    });

    /**
     *
     */
    it('create number - string', () => {
        const result = DataContentHelper.create('1');

        expect(result).toBeInstanceOf(NativeContent);
        expect(result.getValue()).toBe(1);
    });

    /**
     *
     */
    it('create number - string - quoted', () => {
        const result = DataContentHelper.create('"1"');

        expect(result).toBeInstanceOf(TextContent);
        expect(result.getValue()).toBe('1');
    });

    /**
     *
     */
    it('create number - string - double quoted', () => {
        const result = DataContentHelper.create('""1""');

        expect(result).toBeInstanceOf(TextContent);
        expect(result.getValue()).toBe('"1"');
    });

    /**
     *
     */
    it('create boolean', () => {
        const result = DataContentHelper.create(true);

        expect(result).toBeInstanceOf(NativeContent);
        expect(result.getValue()).toBeTruthy();
    });

    /**
     *
     */
    it('create boolean - string', () => {
        const result = DataContentHelper.create('1');

        expect(result).toBeInstanceOf(NativeContent);
        expect(result.getValue()).toBeTruthy();
    });

    /**
     *
     */
    it('create boolean - string - quoted', () => {
        const result = DataContentHelper.create('"true"');

        expect(result).toBeInstanceOf(TextContent);
        expect(result.getValue()).toBe('true');
    });

    /**
     *
     */
    it('create boolean - string - double quoted', () => {
        const result = DataContentHelper.create('""true""');

        expect(result).toBeInstanceOf(TextContent);
        expect(result.getValue()).toBe('"true"');
    });
});
