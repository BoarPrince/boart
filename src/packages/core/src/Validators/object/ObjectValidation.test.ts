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

    test('should not array', () => {
        expect(() => ObjectValidator.instance({}).shouldArray()).toThrow('object is not of type array => {}');
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
        ).toThrow(`must contain property 'd', but only contains 'a, b, c'`);
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
            }).containsPropertiesOnly(['a', 'b', 'c'])
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
            }).containsPropertiesOnly(['a', 'b', 'c'], ['d'])
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
            }).containsPropertiesOnly(['a', 'b', 'c'], ['d'])
        ).toThrow(`property 'e' not known. Allowed are 'a, b, c, d'`);
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
        ).toThrow(`property 'a' is not of type string`);
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
        ).toThrow(`property 'a' is not an object`);
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
        ).toThrow(`property 'a' is not an object`);
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
        ).toThrow(`property 'a' is not an array`);
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
        ).toThrow(`property 'a' is not an array`);
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
        ).toThrow(`property 'b' is not an object => 'b: 2'`);
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
        ).toThrow(`property 'b' is not of type string => 'b: 2'`);
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
        ).toThrow(`property 'c' is not of type string => 'c: undefined'`);
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
        ).toThrow(`property 'b' is not of type string => 'b: 2'`);
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
                .object()
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
                .object()
                .prop('a')
                .shouldString()
                .parent()
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
                .object()
                .prop('a')
                .shouldString()
                .parent()
                .prop('b')
                .shouldString()
        ).toThrow(`property 'b' is not of type string => 'b: 4'`);
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
                .object()
                .prop('a')
                .object()
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
                .object()
                .prop('a')
                .object()
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
        ).toThrow(`value 'fourth' is not allowd for property 'a'. Allowed values are => 'first, second, third'`);
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
                .object()
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
                .object()
                .prop('a')
                .object()
                .prop('c')
                .shouldHaveValueOf('7', '6')
        ).not.toThrow();
    });
});
