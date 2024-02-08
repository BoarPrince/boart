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
    it('create string', () => {
        const value = DataContentHelper.create('a');
        expect(value).toBeInstanceOf(TextContent);
        expect(value.toString()).toBe('a');
    });

    /**
     *
     */
    it('create string is not nullOrUndefined', () => {
        const value = DataContentHelper.create('a');
        expect(value).toBeInstanceOf(TextContent);
        expect(value.isNullOrUndefined()).toBeFalsy();
    });

    /**
     *
     */
    it('create undefined is native', () => {
        const value = DataContentHelper.create();
        expect(value).toBeInstanceOf(NativeContent);
    });

    /**
     *
     */
    it('create undefined is undefined value', () => {
        const value = DataContentHelper.create();
        expect(value.toString()).toBeUndefined();
    });

    /**
     *
     */
    it('create null is native', () => {
        const value = DataContentHelper.create(null);
        expect(value).toBeInstanceOf(NullContent);
    });

    /**
     *
     */
    it('create null is null value', () => {
        const value = DataContentHelper.create(null);
        expect(value.getValue()).toBe(null);
        expect(value.getText()).toBeNull();
        expect(value.toString()).toBeNull();
    });

    /**
     *
     */
    it('create a number', () => {
        const value = DataContentHelper.create(1);
        expect(value).toBeInstanceOf(NativeContent);
    });

    /**
     *
     */
    it('create a boolean', () => {
        const value = DataContentHelper.create(true);
        expect(value).toBeInstanceOf(NativeContent);
    });

    /**
     *
     */
    it('create an object', () => {
        const value = DataContentHelper.create({});
        expect(value).toBeInstanceOf(ObjectContent);
    });

    /**
     *
     */
    it('create an array', () => {
        const value = DataContentHelper.create(['d', 'e', 5]);
        expect(value).toBeInstanceOf(ObjectContent);
        expect(value.toJSON()).toBe('["d","e",5]');
    });

    /**
     *
     */
    it('create a multi dimensional array', () => {
        const value = DataContentHelper.create(['a', 'b']);
        expect(value).toBeInstanceOf(ObjectContent);
        expect(value.toJSON()).toBe('["a","b"]');
    });

    /**
     *
     */
    it('create an one dimensional string array', () => {
        const value = DataContentHelper.create(['a']);
        expect(value).toBeInstanceOf(ObjectContent);
        expect(value.toJSON()).toBe('["a"]');
    });

    /**
     *
     */
    it('create an one dimensional boolean array (true)', () => {
        const value = DataContentHelper.create([true]);
        expect(value).toBeInstanceOf(ObjectContent);
        expect(value.getValue()).toStrictEqual([true]);
        expect(JSON.stringify(value.getValue())).toStrictEqual('[true]');
        expect(value.toJSON()).toBe('[true]');
    });

    /**
     *
     */
    it('create an one dimensional boolean array (false)', () => {
        const value = DataContentHelper.create([false]);
        expect(value).toBeInstanceOf(ObjectContent);
        expect(value.getValue()).toStrictEqual([false]);
        expect(value.toJSON()).toBe('[false]');
    });

    /**
     *
     */
    it('create an one dimensional number array', () => {
        const value = DataContentHelper.create([1]);
        expect(value).toBeInstanceOf(ObjectContent);
        expect(value.getValue()).toStrictEqual([1]);
        expect(value.toJSON()).toBe('[1]');
    });

    /**
     *
     */
    it('create an one dimensional number array', () => {
        const value = DataContentHelper.create([0]);
        expect(value).toBeInstanceOf(ObjectContent);
        expect(value.getValue()).toStrictEqual([0]);
        expect(value.toJSON()).toBe('[0]');
    });

    /**
     *
     */
    it('create an one dimensional undefined array', () => {
        const value = DataContentHelper.create([undefined]);
        expect(value).toBeInstanceOf(ObjectContent);
        expect(value.toJSON()).toBe('[null]');
    });

    /**
     *
     */
    it('create an one dimensional null array', () => {
        const value = DataContentHelper.create([null]);
        expect(value).toBeInstanceOf(ObjectContent);
        expect(value.toJSON()).toBe('[null]');
    });

    /**
     *
     */
    it('create an one dimensional unassigned array', () => {
        const value = DataContentHelper.create([]);
        expect(value).toBeInstanceOf(ObjectContent);
        expect(value.toJSON()).toBe('[]');
    });

    /**
     *
     */
    it('create an one dimensional object', () => {
        const value = DataContentHelper.create([{}]);
        expect(value).toBeInstanceOf(ObjectContent);
    });

    /**
     *
     */
    it('create an one dimensional dataContent (NativeContent)', () => {
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
    it('nullContent', () => {
        const result = DataContentHelper.isNullOrUndefined(new NullContent());
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('nativeContent - undefined', () => {
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
    it('nativeContent - number', () => {
        const result = DataContentHelper.isNullOrUndefined(new NativeContent(1));
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('null - isContent', () => {
        const result = DataContentHelper.isContent(null);
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('NullContent - isContent', () => {
        const result = DataContentHelper.isContent(new NullContent());
        expect(result).toBeTruthy();
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
