import { ContentType } from './ContentType';
import { DataContentHelper } from './DataContentHelper';
import { NativeContent } from './NativeContent';
import { NullContent } from './NullContent';
import { ObjectContent } from './ObjectContent';
import { TextContent } from './TextContent';

/**
 *
 */
describe('string checking', () => {
    /**
     *
     */
    it('check if string is string', () => {
        const isString = DataContentHelper.isString('a');
        expect(isString).toBeTruthy();
    });

    /**
     *
     */
    it('check if number is not a string', () => {
        const isString = DataContentHelper.isString(1);
        expect(isString).toBeFalsy();
    });

    /**
     *
     */
    it('check if boolean is not a string', () => {
        const isString = DataContentHelper.isString(true);
        expect(isString).toBeFalsy();
    });

    /**
     *
     */
    it('check if null is not a string', () => {
        const isString = DataContentHelper.isString(null);
        expect(isString).toBeFalsy();
    });

    /**
     *
     */
    it('check if undefined is not a string', () => {
        const isString = DataContentHelper.isString(undefined);
        expect(isString).toBeFalsy();
    });

    /**
     *
     */
    it('check if object is not a string', () => {
        const isString = DataContentHelper.isString({});
        expect(isString).toBeFalsy();
    });

    /**
     *
     */
    it('check if array is not a string', () => {
        const isString = DataContentHelper.isString([]);
        expect(isString).toBeFalsy();
    });
});

/**
 *
 */
describe('native checking', () => {
    /**
     *
     */
    it.each([
        ['01', 'number', 1], //
        ['02', 'boolean', true],
        ['03', 'undefined', undefined],
        ['04', 'undefined', null],
        ['05', 'object', {}],
        ['06', 'array', []]
    ])(`%s not a string: %s, native value: '%s'`, (_: string, __: string, nativeValue?: ContentType | null) => {
        const isString = DataContentHelper.isString(nativeValue as unknown as string);
        expect(isString).toBeFalsy();
    });

    /**
     *
     */
    it.each([
        ['01 - number', 1, '1', NativeContent], //
        ['02 - boolean', true, 'true', NativeContent],
        ['03 - undefined', undefined, undefined, NativeContent],
        ['04 - null', null, null, NullContent],
        ['05 - object', {}, '{}', ObjectContent],
        ['06 - array', [], '[]', ObjectContent]
    ])(
        `create:toString: %s, native value '%s', toString value: '%s'`,
        (
            _: string, //
            nativeValue?: ContentType | null,
            expectedValue?: ContentType | null,
            expectedType?: any | null
        ) => {
            const result = DataContentHelper.create(nativeValue);
            expect(result).toBeInstanceOf(expectedType);
            expect(result.toString()).toBe(expectedValue);
        }
    );
});

/**
 *
 */
describe('check create DataContent', () => {
    /**
     *
     */
    it('Create string', () => {
        const value = DataContentHelper.create('a');
        expect(value).toBeInstanceOf(TextContent);
        expect(value.toString()).toBe('a');
    });

    /**
     *
     */
    it('Create string is not nullOrUndefined', () => {
        const value = DataContentHelper.create('a');
        expect(value).toBeInstanceOf(TextContent);
        expect(value.isNullOrUndefined()).toBeFalsy();
    });

    /**
     *
     */
    it('Create undefined is native', () => {
        const value = DataContentHelper.create();
        expect(value).toBeInstanceOf(NativeContent);
    });

    /**
     *
     */
    it('Create undefined is undefined value', () => {
        const value = DataContentHelper.create();
        expect(value.toString()).toBeUndefined();
    });

    /**
     *
     */
    it('Create null is native', () => {
        const value = DataContentHelper.create(null);
        expect(value).toBeInstanceOf(NullContent);
    });

    /**
     *
     */
    it('Create null is null value', () => {
        const value = DataContentHelper.create(null);
        expect(value.getValue()).toBe(null);
        expect(value.getText()).toBeNull();
        expect(value.toString()).toBeNull();
    });

    /**
     *
     */
    it('Create a number', () => {
        const value = DataContentHelper.create(1);
        expect(value).toBeInstanceOf(NativeContent);
    });

    /**
     *
     */
    it('Create a boolean', () => {
        const value = DataContentHelper.create(true);
        expect(value).toBeInstanceOf(NativeContent);
    });

    /**
     *
     */
    it('Create an object', () => {
        const value = DataContentHelper.create({});
        expect(value).toBeInstanceOf(ObjectContent);
    });

    /**
     *
     */
    it('Create an array', () => {
        const value = DataContentHelper.create(['d', 'e', 5]);
        expect(value).toBeInstanceOf(ObjectContent);
        expect(value.toJSON()).toBe('["d","e",5]');
    });

    /**
     *
     */
    it('Create a multi dimensional array', () => {
        const value = DataContentHelper.create(['a', 'b']);
        expect(value).toBeInstanceOf(ObjectContent);
        expect(value.toJSON()).toBe('["a","b"]');
    });

    /**
     *
     */
    it('Create an one dimensional string array', () => {
        const value = DataContentHelper.create(['a']);
        expect(value).toBeInstanceOf(ObjectContent);
        expect(value.toJSON()).toBe('["a"]');
    });

    /**
     *
     */
    it('Create an one dimensional boolean array (true)', () => {
        const value = DataContentHelper.create([true]);
        expect(value).toBeInstanceOf(ObjectContent);
        expect(value.getValue()).toEqual([true]);
        expect(JSON.stringify(value.getValue())).toEqual('[true]');
        expect(value.toJSON()).toBe('[true]');
    });

    /**
     *
     */
    it('Create an one dimensional boolean array (false)', () => {
        const value = DataContentHelper.create([false]);
        expect(value).toBeInstanceOf(ObjectContent);
        expect(value.getValue()).toEqual([false]);
        expect(value.toJSON()).toBe('[false]');
    });

    /**
     *
     */
    it('Create an one dimensional number array', () => {
        const value = DataContentHelper.create([1]);
        expect(value).toBeInstanceOf(ObjectContent);
        expect(value.getValue()).toEqual([1]);
        expect(value.toJSON()).toBe('[1]');
    });

    /**
     *
     */
    it('Create an one dimensional number array', () => {
        const value = DataContentHelper.create([0]);
        expect(value).toBeInstanceOf(ObjectContent);
        expect(value.getValue()).toEqual([0]);
        expect(value.toJSON()).toBe('[0]');
    });

    /**
     *
     */
    it('Create an one dimensional undefined array', () => {
        const value = DataContentHelper.create([undefined]);
        expect(value).toBeInstanceOf(ObjectContent);
        expect(value.toJSON()).toBe('[null]');
    });

    /**
     *
     */
    it('Create an one dimensional null array', () => {
        const value = DataContentHelper.create([null]);
        expect(value).toBeInstanceOf(ObjectContent);
        expect(value.toJSON()).toBe('[null]');
    });

    /**
     *
     */
    it('Create an one dimensional unassigned array', () => {
        const value = DataContentHelper.create([]);
        expect(value).toBeInstanceOf(ObjectContent);
        expect(value.toJSON()).toBe('[]');
    });

    /**
     *
     */
    it('Create an one dimensional object', () => {
        const value = DataContentHelper.create([{}]);
        expect(value).toBeInstanceOf(ObjectContent);
    });

    /**
     *
     */
    it('Create an one dimensional dataContent (NativeContent)', () => {
        const value = DataContentHelper.create([new NativeContent(1)]);
        expect(value).toBeInstanceOf(ObjectContent);
        expect(value.toJSON()).toBe('[1]');
    });

    /**
     *
     */
    it('check if object', () => {
        const value = DataContentHelper.create('{"a": "b"}');
        expect(DataContentHelper.isObject(value)).toBeTruthy();
    });

    /**
     *
     */
    it('check not if object', () => {
        const value = DataContentHelper.create('{"a": "b"}');
        expect(DataContentHelper.isObject(value)).toBeTruthy();
    });

    /**
     *
     */
    it('create number value', () => {
        const value = DataContentHelper.create('{"a": 1}');
        expect(DataContentHelper.isObject(value)).toBeTruthy();
    });

    /**
     *
     */
    it('create boolean value (true)', () => {
        const value = DataContentHelper.create('{"a": true}');
        expect(DataContentHelper.isObject(value)).toBeTruthy();
    });

    /**
     *
     */
    it('create boolean value (false)', () => {
        const value = DataContentHelper.create('{"a": false}');
        expect(DataContentHelper.isObject(value)).toBeTruthy();
    });

    /**
     *
     */
    it('create object value with null', () => {
        const value = DataContentHelper.create('{"a": null}');
        expect(DataContentHelper.isObject(value)).toBeTruthy();
    });

    /**
     *
     */
    it('create null value', () => {
        const value = DataContentHelper.create('null');
        expect(DataContentHelper.isObject(value)).toBeFalsy();
    });

    /**
     *
     */
    it('create boolean value', () => {
        const value = DataContentHelper.create('false');
        expect(DataContentHelper.isObject(value)).toBeFalsy();
    });

    /**
     *
     */
    it('check non data object (number)', () => {
        expect(DataContentHelper.isObject(1)).toBeFalsy();
    });

    /**
     *
     */
    it('check non data object (boolean)', () => {
        expect(DataContentHelper.isObject(false)).toBeFalsy();
    });

    /**
     *
     */
    it('check non data object (string)', () => {
        expect(DataContentHelper.isObject('xxx')).toBeFalsy();
    });

    /**
     *
     */
    it('check non data object (object)', () => {
        expect(DataContentHelper.isObject({ getValue: true })).toBeFalsy();
    });
});

/**
 *
 */
describe('deep getting', () => {
    /**
     *
     */
    it('deep get property (object) - leaf', () => {
        const val = new ObjectContent({
            a: {
                b: {
                    c: {
                        d: 'e'
                    }
                }
            }
        });
        const propValue = DataContentHelper.getByPath('a#b#c#d', val);
        expect(propValue.toString()).toBe('e');
    });

    /**
     *
     */
    it('deep get property (object) - root', () => {
        const val = new ObjectContent({
            a: {
                b: {
                    c: {
                        d: 'e'
                    }
                }
            }
        });
        const propValue = DataContentHelper.getByPath('a', val);
        expect(propValue.toString()).toBe('{"b":{"c":{"d":"e"}}}');
    });

    /**
     *
     */
    it('deep get property (object) - multiple keys', () => {
        const val = new ObjectContent({
            a: {
                b: {
                    c: {
                        d: 'e'
                    }
                }
            }
        });
        const propValue = DataContentHelper.getByPath('a.b.c', val);
        expect(propValue.toString()).toBe('{"d":"e"}');
    });

    /**
     *
     */
    it('deep get property (object) - multiple keys - datacontent', () => {
        const val = new ObjectContent({
            a: {
                b: new ObjectContent({
                    c: new ObjectContent({
                        d: 'e'
                    })
                })
            }
        });
        const propValue = DataContentHelper.getByPath('a.b.c', val);
        expect(propValue.toString()).toBe('{"d":"e"}');
    });

    /**
     *
     */
    it('get deep property (string) from object value', () => {
        const val = new ObjectContent('{"a": "b", "c": 1, "d": {"e": "f"}}');
        const propValue1 = DataContentHelper.getByPath('d', val);
        const propValue = DataContentHelper.getByPath('e', propValue1);

        expect(propValue).toBeInstanceOf(TextContent);
        expect(propValue.toString()).toBe('f');
    });

    /**
     *
     */
    it('get deep property with array (first level)', () => {
        const val = new ObjectContent({ a: [{ b: 'c' }, { d: 'e' }] });
        const propValue = DataContentHelper.getByPath('a.0.b', val);

        expect(propValue).toBeInstanceOf(TextContent);
        expect(propValue.toString()).toBe('c');
    });

    /**
     *
     */
    it('get deep property with array (second level)', () => {
        const val = new ObjectContent({ a: [{ b: 'c' }, { d: ['e', 7] }] });
        const propValue = DataContentHelper.getByPath('a.1.d.1', val);

        expect(propValue).toBeInstanceOf(NativeContent);
        expect(propValue.toString()).toBe('7');
    });

    /**
     *
     */
    it('get deep property with array (second level, array syntax)', () => {
        const val = new ObjectContent({ a: [{ b: 'c' }, { d: ['e', 7] }] });
        const propValue = DataContentHelper.getByPath('a[1].d[1]', val);

        expect(propValue).toBeInstanceOf(NativeContent);
        expect(propValue.toString()).toBe('7');
    });

    /**
     *
     */
    it('get deep property with array (two levels, array syntax)', () => {
        const val = new ObjectContent({ a: [{ b: 'c' }, ['e', 7]] });
        const propValue = DataContentHelper.getByPath('a[1][1]', val);

        expect(propValue).toBeInstanceOf(NativeContent);
        expect(propValue.toString()).toBe('7');
    });

    /**
     *
     */
    it('get deep property with array (starting with array, array syntax)', () => {
        const val = new ObjectContent(['a', ['b', { c: 7 }]]);
        const propValue = DataContentHelper.getByPath('[1][1].c', val);

        expect(propValue).toBeInstanceOf(NativeContent);
        expect(propValue.toString()).toBe('7');
    });

    /**
     *
     */
    it('get deep property from string', () => {
        const val = new ObjectContent('a');

        try {
            DataContentHelper.getByPath('z', val);
        } catch (error) {
            expect(error.message).toBe('getting "z" not possible, because "z" is not an object or an array.\nData context:\n"a"');
            return;
        }

        throw Error('error must be thrown if property does not exists');
    });

    /**
     *
     */
    it('get deep but property does not exists (1)', () => {
        const val = new ObjectContent('{"a": "b"}');

        try {
            DataContentHelper.getByPath('a.c', val);
        } catch (error) {
            expect(error.message).toBe('getting "a.c" not possible, because "c" is not an object or an array.\nData context:\n"b"');
            return;
        }

        throw Error('error must be thrown if property does not exists');
    });

    /**
     *
     */
    it('get deep but property does not exists (2)', () => {
        const val = new ObjectContent('{"a": "b"}');

        try {
            DataContentHelper.getByPath('z', val);
        } catch (error) {
            expect(error.message).toBe(
                `getting "z" not possible, because "z" is not an object or an array.\nData context:\n${JSON.stringify(
                    val.valueOf(),
                    null,
                    '  '
                )}`
            );
            return;
        }

        throw Error('error must be thrown if property does not exists');
    });

    /**
     *
     */
    it('get deep property from object value (wrong path, second element)', () => {
        const val = new ObjectContent('{"a": "b", "c": 1, "d": {"e": "f"}}');
        const propValue = DataContentHelper.getByPath('d', val);

        try {
            DataContentHelper.getByPath('z', propValue);
        } catch (error) {
            expect(error.message).toBe(
                `getting "z" not possible, because "z" is not an object or an array.\nData context:\n${JSON.stringify(
                    propValue.valueOf(),
                    null,
                    '  '
                )}`
            );
            return;
        }

        throw Error('error must be thrown if property does not exists');
    });

    /**
     *
     */
    it('get deep property from object value (wrong path, first element)', () => {
        const val = new ObjectContent('{"a": "b", "c": 1, "d": {"e": "f"}}');

        try {
            DataContentHelper.getByPath('z', val);
        } catch (error) {
            expect(error.message).toBe(
                `getting "z" not possible, because "z" is not an object or an array.\nData context:\n${JSON.stringify(
                    val.valueOf(),
                    null,
                    '  '
                )}`
            );
            return;
        }

        throw Error('error must be thrown if property does not exists');
    });

    /**
     *
     */
    it('get deep property from recursice containing ObjectContents', () => {
        const val = new ObjectContent({ a: new ObjectContent({ b: new ObjectContent({ c: new TextContent('d') }) }) });
        const propValue = DataContentHelper.getByPath('a.b.c', val);

        expect(propValue).toBeInstanceOf(TextContent);
        expect(propValue.toString()).toBe('d');
    });

    /**
     *
     */
    it('try getting value from none DataContent', () => {
        const data = new TextContent('abc');
        try {
            DataContentHelper.getByPath('a.b', data);
        } catch (error) {
            expect(error.message).toBe(`getting "a.b" not possible, because "a" is not an object or an array.\nData context:\n"abc"`);
            return;
        }
        fail('expection was not thrown');
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
    it('try getting null value (deep)', () => {
        const data = new ObjectContent({ a: { b: null } });
        try {
            DataContentHelper.getByPath('a.b.c', data);
        } catch (error) {
            expect(error.message).toBe('getting "a.b.c" not possible, because "c" is not an object or an array.');
            return;
        }
        fail('expection was not thrown');
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
describe('deep setting', () => {
    /**
     *
     */
    it('set first level value (empty object)', () => {
        const sut = DataContentHelper.setByPath('a', 'a', new ObjectContent());
        expect(sut.toJSON()).toBe('{"a":"a"}');
    });

    /**
     *
     */
    it('set first level value (empty map ffddfd)', () => {
        const sut = DataContentHelper.setByPath('a', 'a', new ObjectContent());
        expect(sut.toJSON()).toBe('{"a":"a"}');
    });

    /**
     *
     */
    it('create array one dimensional (first level)', () => {
        const sut = DataContentHelper.setByPath('0', 'a', new ObjectContent());
        expect(sut.toJSON()).toBe('["a"]');
    });

    /**
     *
     */
    it('set deep on new object', () => {
        const sut = DataContentHelper.setByPath('a.b.c.d.e.f.g', 'a', new ObjectContent());
        expect(sut.toJSON()).toBe('{"a":{"b":{"c":{"d":{"e":{"f":{"g":"a"}}}}}}}');
    });

    /**
     *
     */
    it('set deep on new object (with array)', () => {
        const sut = DataContentHelper.setByPath('[0].d', 'a', new ObjectContent());
        expect(sut.toJSON()).toBe('[{"d":"a"}]');
    });

    /**
     *
     */
    it('set deep on new object (with array) adsf', () => {
        const sut = DataContentHelper.setByPath('a.b.c[0].d.e.f.g', 'a', new ObjectContent());
        expect(sut.toJSON()).toBe('{"a":{"b":{"c":[{"d":{"e":{"f":{"g":"a"}}}}]}}}');
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
        ['06', { b: 'b' }, 'a#b', 'a', '{"b":"b","a":{"b":"a"}}'],
        ['07', { b: 'b' }, 'a#b', 'a', '{"b":"b","a":{"b":"a"}}'],
        ['08', { b: 'b' }, 'a#b#c', 'd', '{"b":"b","a":{"b":{"c":"d"}}}'],
        ['09', { b: [{ c: 'd' }, 'e', 5] }, 'b.0.c', 'a', '{"b":[{"c":"a"},"e",5]}'],
        ['10', { b: { c: ['d', 'e', 5] } }, 'b.c.0', 'a', '{"b":{"c":["a","e",5]}}']
    ])(
        `%s:, intial: %s, path: '%s', value: '%s', expected: %s`,
        (_: string, initialContent: ContentType, selector: string, value: ContentType, expectedJSON: string) => {
            const sut_object = DataContentHelper.setByPath(selector, value, new ObjectContent(initialContent));
            expect(sut_object.toJSON()).toBe(expectedJSON);
        }
    );

    /**
     *
     */
    it('set path two times', () => {
        const sut_object = DataContentHelper.setByPath('a', 'c', new ObjectContent({ a: 'b' }));
        expect(sut_object.toJSON()).toBe('{"a":"c"}');

        const sut_object2 = DataContentHelper.setByPath('a', 'd', sut_object);
        expect(sut_object2.toJSON()).toBe('{"a":"d"}');
    });

    /**
     *
     */
    it('try set deep structure to a none object', () => {
        const dataContent = DataContentHelper.setByPath('a', 'a', new ObjectContent({ a: { b: 'c' } }));
        try {
            DataContentHelper.setByPath('a#b#c', 'd', dataContent);
        } catch (error) {
            expect(error.message).toBe('cannot set value to an \'Text\' value, selector: "a.b.c"');
            return;
        }
        fail('expection was not thrown');
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
