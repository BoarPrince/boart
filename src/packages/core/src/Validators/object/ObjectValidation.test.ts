import { ObjectValidator } from './ObjectValidator';

/**
 *
 */
describe('simple object validation', () => {
    /**
     *
     */

    test('is object', () => {
        expect(() => ObjectValidator.instance({ a: 1 })).not.toThrow();
    });

    /**
     *
     */
    test('should array', () => {
        expect(() => ObjectValidator.instance([]).shouldArray()).not.toThrow();
    });

    /**
     *
     */
    test('should array of string', () => {
        expect(() => ObjectValidator.instance(['a']).shouldArray('string')).not.toThrow();
    });

    /**
     *
     */
    test('should array of boolean', () => {
        expect(() => ObjectValidator.instance([true]).shouldArray('boolean')).not.toThrow();
    });

    /**
     *
     */
    test('should array of boolean - not valid', () => {
        expect(() => ObjectValidator.instance(['true']).shouldArray('boolean')).toThrow(
            `array is not of type boolean => 'boolean: ["true"]'`
        );
    });

    /**
     *
     */
    test('should object', () => {
        expect(() => ObjectValidator.instance({}).shouldObject()).not.toThrow();
    });

    /**
     *
     */
    test('should string', () => {
        expect(() => ObjectValidator.instance('').shouldString()).not.toThrow();
    });

    /**
     *
     */

    test('should not array', () => {
        expect(() => ObjectValidator.instance({}).shouldArray()).toThrow('path: $\nobject is not of type array => {}');
    });

    /**
     *
     */
    test('contains properties', () => {
        expect(() =>
            ObjectValidator.instance({
                a: 1,
                b: 2,
                c: 3
            }).containsProperties(['a', 'b', 'c'])
        ).not.toThrow();
    });

    /**
     *
     */

    test('contains not all properties', () => {
        expect(() =>
            ObjectValidator.instance({
                a: 1,
                b: 2,
                c: 3
            }).containsProperties(['a', 'b', 'd'])
        ).toThrow(`path: $\nmust contain property 'd', but only contains 'a, b, c'`);
    });

    /**
     *
     */
    test('does not have to much properties - 1', () => {
        expect(() =>
            ObjectValidator.instance({
                a: 1,
                b: 2,
                c: 3
            }).onlyContainsProperties(['a', 'b', 'c'])
        ).not.toThrow();
    });

    /**
     *
     */
    test('does not have to much properties - 2', () => {
        expect(() =>
            ObjectValidator.instance({
                a: 1,
                b: 2,
                c: 3
            }).onlyContainsProperties(['a', 'b', 'c'], ['d'])
        ).not.toThrow();
    });

    /**
     *
     */
    test('does have to much properties', () => {
        expect(() =>
            ObjectValidator.instance({
                a: 1,
                b: 2,
                c: 3,
                e: 5
            }).onlyContainsProperties(['a', 'b', 'c'], ['d'])
        ).toThrow(`path: $\nproperty 'e' not known. Allowed are 'a, b, c, d'`);
    });
});

/**
 *
 */
describe('first level prop validation', () => {
    /**
     *
     */

    test('should string', () => {
        expect(() =>
            ObjectValidator.instance({
                a: '',
                b: 2,
                c: 3,
                e: 5
            })
                .prop('a')
                .shouldString()
        ).not.toThrow();
    });

    /**
     *
     */

    test('should not string', () => {
        expect(() =>
            ObjectValidator.instance({
                a: 1,
                b: 2,
                c: 3,
                e: 5
            })
                .prop('a')
                .shouldString()
        ).toThrow(`path: $.a\nproperty 'a' is not of type string`);
    });

    /**
     *
     */
    test('should boolean', () => {
        expect(() =>
            ObjectValidator.instance({
                a: true,
                b: 2,
                c: 3,
                e: 5
            })
                .prop('a')
                .shouldBoolean()
        ).not.toThrow();
    });

    /**
     *
     */
    test('should boolean - not valid', () => {
        expect(() =>
            ObjectValidator.instance({
                a: 1,
                b: 2,
                c: 3,
                e: 5
            })
                .prop('a')
                .shouldBoolean()
        ).toThrow(`property 'a' is not of type boolean`);
    });

    /**
     *
     */

    test('should object', () => {
        expect(() =>
            ObjectValidator.instance({
                a: {},
                b: 2,
                c: 3
            })
                .prop('a')
                .shouldObject()
        ).not.toThrow();
    });

    /**
     *
     */
    test('should not object - 1', () => {
        expect(() =>
            ObjectValidator.instance({
                a: 1,
                b: 2,
                c: 3
            })
                .prop('a')
                .shouldObject()
        ).toThrow(`path: $.a\nproperty 'a' is not an object`);
    });

    /**
     *
     */
    test('should not object - 2', () => {
        expect(() =>
            ObjectValidator.instance({
                a: [],
                b: 2,
                c: 3
            })
                .prop('a')
                .shouldObject()
        ).toThrow(`path: $.a\nproperty 'a' is not an object`);
    });

    /**
     *
     */

    test('should array', () => {
        expect(() =>
            ObjectValidator.instance({
                a: [],
                b: 2,
                c: 3
            })
                .prop('a')
                .shouldArray()
        ).not.toThrow();
    });

    /**
     *
     */
    test('should not array - 1', () => {
        expect(() =>
            ObjectValidator.instance({
                a: 1,
                b: 2,
                c: 3
            })
                .prop('a')
                .shouldArray()
        ).toThrow(`path: $.a\nproperty 'a' is not an array`);
    });

    /**
     *
     */
    test('should not array - 2', () => {
        expect(() =>
            ObjectValidator.instance({
                a: {},
                b: 2,
                c: 3
            })
                .prop('a')
                .shouldArray()
        ).toThrow(`path: $.a\nproperty 'a' is not an array`);
    });

    /**
     *
     */

    test('check more properties', () => {
        expect(() =>
            ObjectValidator.instance({
                a: {},
                b: 2,
                c: {}
            })
                .prop('a')
                .shouldObject()
                .prop('c')
                .shouldObject()
        ).not.toThrow();
    });

    /**
     *
     */

    test('check more properties not valid', () => {
        expect(() =>
            ObjectValidator.instance({
                a: {},
                b: 2,
                c: {}
            })
                .prop('a')
                .shouldObject()
                .prop('b')
                .shouldObject()
        ).toThrow(`path: $.b\nproperty 'b' is not an object => 'b: 2'`);
    });
});

/**
 *
 */
describe('array prop validation', () => {
    /**
     *
     */
    test('one array alement', () => {
        expect(() =>
            ObjectValidator.instance([
                {
                    a: '1',
                    b: '2'
                }
            ])
                .prop('a')
                .shouldString()
        ).not.toThrow();
    });

    /**
     *
     */
    test('one array alement - exact props', () => {
        expect(() =>
            ObjectValidator.instance([
                {
                    a: '1',
                    b: '2'
                }
            ])
                .onlyContainsProperties(['a', 'b'])
                .prop('a')
                .shouldString()
                .prop('b')
                .shouldString()
        ).not.toThrow();
    });

    /**
     *
     */
    test('one array alement - not valid - 1', () => {
        expect(() =>
            ObjectValidator.instance([
                {
                    a: '1',
                    b: 2
                }
            ])
                .prop('b')
                .shouldString()
        ).toThrow(`path: $.0.b\nproperty 'b' is not of type string => 'b: 2'`);
    });

    /**
     *
     */
    test('one array alement - not valid - 2', () => {
        expect(() =>
            ObjectValidator.instance([
                {
                    a: '1',
                    b: 2
                }
            ])
                .prop('c')
                .shouldString()
        ).toThrow(`path: $.0.c\nproperty 'c' is not of type string => 'c: undefined'`);
    });

    /**
     *
     */
    test('one array alement - two checks', () => {
        expect(() =>
            ObjectValidator.instance([
                {
                    a: '1',
                    b: '2'
                }
            ])
                .shouldArray()
                .prop('a')
                .shouldString()
                .prop('b')
                .shouldString()
        ).not.toThrow();
    });

    /**
     *
     */
    test('one array alement - two checks - not valid', () => {
        expect(() =>
            ObjectValidator.instance([
                {
                    a: '1',
                    b: 2
                }
            ])
                .prop('a')
                .shouldString()
                .prop('b')
                .shouldString()
        ).toThrow(`path: $.0.b\nproperty 'b' is not of type string => 'b: 2'`);
    });

    /**
     *
     */
    test('property has boolean array', () => {
        expect(() =>
            ObjectValidator.instance([
                {
                    a: [true, false],
                    b: '2'
                }
            ])
                .shouldArray()
                .prop('a')
                .shouldArray('boolean')
        ).not.toThrow();
    });

    /**
     *
     */
    test('property has boolean array - not valid', () => {
        expect(() =>
            ObjectValidator.instance([
                {
                    a: ['true', 'false'],
                    b: '2'
                }
            ])
                .shouldArray()
                .prop('a')
                .shouldArray('boolean')
        ).toThrow('path: $.0.a\nproperty \'a\' is not of array type boolean => \'a: ["true","false"]\'');
    });
});

/**
 *
 */
describe('deep validation', () => {
    /**
     *
     */

    test('object -> object', () => {
        expect(() =>
            ObjectValidator.instance({
                a: {
                    a: '1',
                    b: '2',
                    c: '3'
                }
            })
                .prop('a')
                .child()
                .prop('a')
                .shouldString()
        ).not.toThrow();
    });

    /**
     *
     */
    test('object -> array -> object', () => {
        expect(() =>
            ObjectValidator.instance({
                a: [
                    {
                        a: '1',
                        b: '2'
                    },
                    {
                        a: '3',
                        b: '4'
                    }
                ]
            })
                .prop('a')
                .child()
                .prop('a')
                .shouldString()
                .prop('b')
                .shouldString()
        ).not.toThrow();
    });

    /**
     *
     */

    test('object -> array -> object - not valid', () => {
        expect(() =>
            ObjectValidator.instance({
                a: [
                    {
                        a: '1',
                        b: '2'
                    },
                    {
                        a: '3',
                        b: 4
                    }
                ]
            })
                .prop('a')
                .child()
                .prop('a')
                .shouldString()
                .prop('b')
                .shouldString()
        ).toThrow(`path: $.a.1.b\nproperty 'b' is not of type string => 'b: 4'`);
    });

    /**
     *
     */
    test('object -> array -> object -> object', () => {
        expect(() =>
            ObjectValidator.instance({
                a: [
                    {
                        a: { c: '5' },
                        b: '2'
                    },
                    {
                        a: { c: '6' },
                        b: '4'
                    }
                ]
            })
                .prop('a')
                .child()
                .prop('a')
                .child()
                .prop('c')
                .shouldString()
        ).not.toThrow();
    });

    /**
     *
     */
    test('object -> array -> object -> array -> object', () => {
        expect(() =>
            ObjectValidator.instance({
                a: [
                    {
                        a: [{ c: '5' }, { c: '5' }],
                        b: '2'
                    },
                    {
                        a: [{ c: '6' }, { c: '5' }],
                        b: '4'
                    }
                ]
            })
                .prop('a')
                .child()
                .prop('a')
                .child()
                .prop('c')
                .shouldString()
        ).not.toThrow();
    });
});

/**
 *
 */
describe('allowed values', () => {
    /**
     *
     */
    enum AllowedValues {
        First = 'first',
        Second = 'second',
        Third = 'third'
    }

    /**
     *
     */
    test('inside object - first level', () => {
        expect(() =>
            ObjectValidator.instance({
                a: 'first'
            })
                .prop('a')
                .shouldHaveValueOf(...Object.values(AllowedValues))
        ).not.toThrow();
    });

    /**
     *
     */
    test('inside object - first level - not valid', () => {
        expect(() =>
            ObjectValidator.instance({
                a: 'fourth'
            })
                .prop('a')
                .shouldHaveValueOf(...Object.values(AllowedValues))
        ).toThrow(`path: $.a\nvalue 'fourth' is not allowd for property 'a'. Allowed values are => 'first, second, third'`);
    });

    /**
     *
     */
    test('inside array - first level', () => {
        expect(() =>
            ObjectValidator.instance([
                {
                    a: 'first'
                },
                {
                    a: 'second'
                }
            ])
                .prop('a')
                .shouldHaveValueOf(...Object.values(AllowedValues))
        ).not.toThrow();
    });

    /**
     *
     */
    test('inside array - first level - not valid', () => {
        expect(() =>
            ObjectValidator.instance([
                {
                    a: 'first'
                },
                {
                    a: 'fourth'
                }
            ])
                .prop('a')
                .shouldHaveValueOf(...Object.values(AllowedValues))
        ).toThrow("value 'fourth' is not allowd for property 'a'. Allowed values are => 'first, second, third'");
    });

    /**
     *
     */
    test('inside object -> array - first level', () => {
        expect(() =>
            ObjectValidator.instance({
                a: [
                    {
                        a: 'first'
                    },
                    {
                        a: 'second'
                    }
                ]
            })
                .prop('a')
                .child()
                .prop('a')
                .shouldHaveValueOf(...Object.values(AllowedValues))
        ).not.toThrow();
    });

    /**
     *
     */
    test('inside object -> array -> object -> array -> object', () => {
        expect(() =>
            ObjectValidator.instance({
                a: [
                    {
                        a: { c: '7' },
                        b: '2'
                    },
                    {
                        a: { c: '6' },
                        b: '4'
                    }
                ]
            })
                .prop('a')
                .child()
                .prop('a')
                .child()
                .prop('c')
                .shouldHaveValueOf('7', '6')
        ).not.toThrow();
    });
});
