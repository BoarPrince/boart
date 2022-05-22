import { DataContentHelper } from './DataContentHelper';
import { NativeContent } from './NativeContent';
import { ObjectContent } from './ObjectContent';
import { TextContent } from './TextContent';
import { ContentType } from './ContentType';
import { NullContent } from './NullContent';

describe('check data contents', () => {
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
            expect(value).toBeInstanceOf(ObjectContent);
        });

        /**
         *
         */
        it('Create undefined is undefined value', () => {
            const value = DataContentHelper.create();
            expect(value.toString()).toBe('{}');
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
            expect(value.getText()).toBe('');
            expect(value.toString()).toBe('');
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
        it('create null value', () => {
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

        /**
         *
         */
        it('check split key with null', () => {
            expect(DataContentHelper.splitKeys(null)).toEqual([]);
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
        it('get deep property with array (starting with array and split as array)', () => {
            const val = new ObjectContent(['a', ['b', { c: 7 }]]);
            const propValue = DataContentHelper.getByPath(['1', '1', 'c'], val);

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
                expect(error.message).toBe('getting "z" not possible, because "z" is not an object or an array');
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
                expect(error.message).toBe('getting "a.c" not possible, because "c" is not an object or an array');
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
                expect(error.message).toBe('getting "z" not possible, because "z" is not an object or an array');
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
                expect(error.message).toBe('getting "z" not possible, because "z" is not an object or an array');
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
                expect(error.message).toBe('getting "z" not possible, because "z" is not an object or an array');
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
                expect(error.message).toBe('getting "a.b" not possible, because "a" is not an object or an array');
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
                expect(error.message).toBe('getting "a.c" not possible, because "c" is not an object or an array');
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
                expect(error.message).toBe('getting "a.b.c" not possible, because "b" is not an object or an array');
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
                expect(error.message).toBe('getting "a.b.c" not possible, because "a" is not an object or an array');
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
                expect(error.message).toBe('getting "a.b.d" not possible, because "d" is not an object or an array');
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
            [null, 'a', 'a', '{"a":"a"}'],
            [undefined, 'a', 'a', '{"a":"a"}'],
            [{ a: 'b' }, 'a', 'a', '{"a":"a"}'],
            [{ b: 'b' }, 'a', 'a', '{"b":"b","a":"a"}'],
            [{ b: 'b' }, 'a#b', 'a', '{"b":"b","a":{"b":"a"}}'],
            [{ b: 'b' }, 'a#b', 'a', '{"b":"b","a":{"b":"a"}}'],
            [{ b: 'b' }, 'a#b#c', 'd', '{"b":"b","a":{"b":{"c":"d"}}}'],
            [{ b: [{ c: 'd' }, 'e', 5] }, 'b.0.c', 'a', '{"b":[{"c":"a"},"e",5]}'],
            [{ b: { c: ['d', 'e', 5] } }, 'b.c.0', 'a', '{"b":{"c":["a","e",5]}}']
        ])(
            `intial: %s, path: '%s', value: '%s', expected: %s`,
            (initialContent: ContentType, path: string, value: ContentType, expectedJSON: string) => {
                const sut_object = DataContentHelper.setByPath(path, value, new ObjectContent(initialContent));
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
        it('set path by using an array', () => {
            const sut_object = DataContentHelper.setByPath(['a', 'b'], 'c', new ObjectContent());
            expect(sut_object.toJSON()).toBe('{"a":{"b":"c"}}');
        });

        /**
         *
         */
        it('set path by using a null content', () => {
            const sut_object = DataContentHelper.setByPath(['a', 'b'], 'c', null);
            expect(sut_object.toJSON()).toBe('{"a":{"b":"c"}}');
        });

        /**
         *
         */
        it('try set deep structure to a none object', () => {
            const dataContent = DataContentHelper.setByPath('a', 'a', new ObjectContent({ a: { b: 'c' } }));
            try {
                DataContentHelper.setByPath('a#b#c', 'd', dataContent);
            } catch (error) {
                expect(error.message).toBe(`cannot set value to an 'Text' value`);
                return;
            }
            fail('expection was not thrown');
        });
    });
});
