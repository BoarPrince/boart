import { ExpectedOperator, ExpectedOperatorInitializer, ExpectedOperatorResult, NativeType } from '@boart/core';

import { IntValidator } from '../../validators/IntValidator';

/**
 *
 */
export class ExpectedOperatorImplementation {
    /**
     *
     */
    private constructor() {
        // only statics
    }

    /**
     *
     */
    private static valueToString(value: NativeType): string {
        if (typeof value === 'object') {
            return JSON.stringify(value);
        } else {
            return value?.toString();
        }
    }

    /**
     *
     */
    static get equals(): ExpectedOperator {
        return {
            name: 'equals',
            description: {
                id: '8f3f561f-c270-43bc-bacc-c3f11d4e81ce',
                title: null,
                description: `Checks a value for equality
                              * can be defined explicity
                              * it's default operator, in case of no defined operator`,
                examples: [
                    {
                        title: 'Checks the response status of an rest call',
                        example: `
                        * Rest call

                          | action                        |value               |
                          |-------------------------------|--------------------|
                          | method:post                   |/rest-url           |
                          | payload                       |<file:payload.json> |
                          | expected:header:equals#status |200                 |`
                    },
                    {
                        title: 'Usage as default operator',
                        example: `
                        * Rest call

                          | action                 |value               |
                          |------------------------|--------------------|
                          | method:post            |/rest-url           |
                          | payload                |<file:payload.json> |
                          | expected:header#status |200                 |`
                    }
                ]
            },
            canCaseInsesitive: true,
            check: (value: NativeType, expectedValue: string): ExpectedOperatorResult => ({
                result: expectedValue.toString() == ExpectedOperatorImplementation.valueToString(value),
                errorMessage: `\n\texpected: ${expectedValue.toString()}\n\tactual: ${ExpectedOperatorImplementation.valueToString(value)}`
            })
        };
    }

    /**
     *
     */
    static get regexp(): ExpectedOperator {
        return {
            name: 'regexp',
            canCaseInsesitive: false,
            check: (value: NativeType, expectedValue: string): ExpectedOperatorResult => {
                const valueAsString = ExpectedOperatorImplementation.valueToString(value);
                const match = valueAsString?.match(expectedValue);
                const matchedValue = !match ? '' : match[0];
                return {
                    result: valueAsString === matchedValue
                };
            }
        };
    }

    /**
     *
     */
    static get startsWith(): ExpectedOperator {
        return {
            name: 'startsWith',
            canCaseInsesitive: true,
            check: (value: NativeType, expectedValue: string): ExpectedOperatorResult => {
                return {
                    result: value == null ? false : value.toString().startsWith(expectedValue)
                };
            }
        };
    }

    /**
     *
     */
    static get contains(): ExpectedOperator {
        return {
            name: 'contains',
            canCaseInsesitive: true,
            check: (value: NativeType, expectedValue: string): ExpectedOperatorResult => {
                const negativeResult = {
                    result: false
                };

                if (value == null) {
                    return negativeResult;
                } else if (Array.isArray(value)) {
                    return {
                        result: Object.values(value).includes(expectedValue)
                    };
                } else if (typeof value === 'object') {
                    return {
                        result: JSON.stringify(value).includes(expectedValue)
                    };
                } else if (typeof value === 'string') {
                    return {
                        result: value.includes(expectedValue)
                    };
                } else {
                    return negativeResult;
                }
            }
        };
    }

    /**
     *
     */
    static get containsKey(): ExpectedOperator {
        return {
            name: 'containsKey',
            canCaseInsesitive: true,

            check: (value: NativeType, expectedValue: string): ExpectedOperatorResult => {
                const negativeResult = {
                    result: false
                };
                const positiveResult = {
                    result: true
                };

                if (value == null) {
                    return negativeResult;
                } else if (Array.isArray(value)) {
                    for (const v of value) {
                        if (typeof v === 'object' && !Array.isArray(v)) {
                            const result = Object.keys(v as object).includes(expectedValue);
                            if (!result) {
                                return negativeResult;
                            }
                        } else if (v === expectedValue) {
                            return positiveResult;
                        } else {
                            return negativeResult;
                        }
                    }
                    return positiveResult;
                } else if (typeof value === 'object') {
                    return {
                        result: Object.keys(value).includes(expectedValue)
                    };
                } else {
                    return negativeResult;
                }
            }
        };
    }

    /**
     *
     */
    private static getCount(value: NativeType, allowNumber = true): { key?: string; length: number } {
        if (value == null) {
            return {
                length: 0
            };
        } else if (Array.isArray(value)) {
            const arrayKeys = Object.keys(value);
            return {
                key: `indexes: '${arrayKeys.join(',')}'`,
                length: arrayKeys.length
            };
        } else if (typeof value === 'number' && allowNumber) {
            return {
                length: value
            };
        } else if (typeof value === 'object') {
            const objectKeys = Object.keys(value);
            return {
                key: `keys: '${objectKeys.join(',')}'`,
                length: objectKeys.length
            };
        } else if (typeof value === 'string' && isNaN(parseInt(value))) {
            return {
                length: value.length
            };
        } else if (typeof value === 'string' && !isNaN(parseInt(value))) {
            return {
                length: parseInt(value)
            };
        } else {
            return {
                length: Number.MIN_VALUE
            };
        }
    }

    /**
     *
     */
    static get smaller(): ExpectedOperator {
        return {
            name: 'smaller',
            canCaseInsesitive: false,
            check: (value: NativeType, expectedValue: string): ExpectedOperatorResult => {
                const count = ExpectedOperatorImplementation.getCount(value);
                const expected = parseInt(expectedValue);
                return {
                    result: count.length === Number.MIN_VALUE ? false : count.length < expected
                };
            }
        };
    }

    /**
     *
     */
    static get greater(): ExpectedOperator {
        return {
            name: 'greater',
            canCaseInsesitive: false,
            check: (value: NativeType, expectedValue: string): ExpectedOperatorResult => {
                const count = ExpectedOperatorImplementation.getCount(value);
                const expected = parseInt(expectedValue);
                return {
                    result: count.length === Number.MIN_VALUE ? false : count.length > expected
                };
            }
        };
    }

    /**
     *
     */
    static get count(): ExpectedOperator {
        return {
            name: 'count',
            validators: [new IntValidator('value')],
            canCaseInsesitive: false,
            check: (value: NativeType, expectedValue: string): ExpectedOperatorResult => {
                const count = ExpectedOperatorImplementation.getCount(value, false);
                const expected = parseInt(expectedValue);
                return {
                    result: count.length === Number.MIN_VALUE ? false : count.length === expected,
                    errorMessage: `, value: ${expectedValue}, actual: ${count.length}`
                };
            }
        };
    }

    /**
     *
     */
    static get countEqualOrGreater(): ExpectedOperator {
        return {
            name: 'count:equal-greater',
            canCaseInsesitive: false,
            check: (value: NativeType, expectedValue: string): ExpectedOperatorResult => {
                const count = ExpectedOperatorImplementation.getCount(value, false);
                const expected = parseInt(expectedValue);
                return {
                    result: count.length === Number.MIN_VALUE ? false : count.length >= expected
                };
            }
        };
    }

    /**
     *
     */
    static get countEqualOrSmaller(): ExpectedOperator {
        return {
            name: 'count:equal-smaller',
            canCaseInsesitive: false,
            check: (value: NativeType, expectedValue: string): ExpectedOperatorResult => {
                const count = ExpectedOperatorImplementation.getCount(value, false);
                const expected = parseInt(expectedValue);
                return {
                    result: count.length === Number.MIN_VALUE ? false : count.length <= expected
                };
            }
        };
    }

    /**
     *
     */
    static get empty(): ExpectedOperator {
        return {
            name: 'empty',
            canCaseInsesitive: false,
            check: (value: NativeType): ExpectedOperatorResult => {
                const count = ExpectedOperatorImplementation.getCount(value, false);
                return {
                    result: count.length === Number.MIN_VALUE ? false : count.length === 0
                };
            }
        };
    }

    /**
     *
     */
    static get isArray(): ExpectedOperator {
        return {
            name: 'array',
            canCaseInsesitive: false,
            check: (value: NativeType): ExpectedOperatorResult => {
                return {
                    result: Array.isArray(value)
                };
            }
        };
    }

    /**
     *
     */
    static get isObject(): ExpectedOperator {
        return {
            name: 'object',
            canCaseInsesitive: false,
            check: (value: NativeType): ExpectedOperatorResult => {
                return {
                    result: !!value && !Array.isArray(value) && typeof value === 'object'
                };
            }
        };
    }

    /**
     *
     */
    static get isNumber(): ExpectedOperator {
        return {
            name: 'number',
            canCaseInsesitive: false,
            check: (value: NativeType): ExpectedOperatorResult => {
                return {
                    result: /^\d+(\.\d+)?$/.test(ExpectedOperatorImplementation.valueToString(value))
                };
            }
        };
    }

    /**
     *
     */
    static get isInt(): ExpectedOperator {
        return {
            name: 'int',
            canCaseInsesitive: false,
            check: (value: NativeType): ExpectedOperatorResult => {
                return {
                    result: /^\d+$/.test(ExpectedOperatorImplementation.valueToString(value))
                };
            }
        };
    }

    /**
     *
     */
    static get isString(): ExpectedOperator {
        return {
            name: 'string',
            canCaseInsesitive: false,
            check: (value: NativeType): ExpectedOperatorResult => {
                return {
                    result: typeof value === 'string',
                    errorMessage: `, value is not of type string (type: ${value.constructor?.name}), actual:\n${JSON.stringify(value)}`
                };
            }
        };
    }

    /**
     *
     */
    static get isNull(): ExpectedOperator {
        return {
            name: 'null',
            canCaseInsesitive: false,
            check: (value: NativeType): ExpectedOperatorResult => {
                return {
                    result: value?.valueOf() == null,
                    errorMessage: `, null: actual: '${(value || '').toString()}'`
                };
            }
        };
    }

    /**
     *
     */
    static addAll(): void {
        ExpectedOperatorInitializer.instance.addOperator(ExpectedOperatorImplementation.equals);
        ExpectedOperatorInitializer.instance.addOperator(ExpectedOperatorImplementation.regexp);
        ExpectedOperatorInitializer.instance.addOperator(ExpectedOperatorImplementation.startsWith);
        ExpectedOperatorInitializer.instance.addOperator(ExpectedOperatorImplementation.contains);
        ExpectedOperatorInitializer.instance.addOperator(ExpectedOperatorImplementation.smaller);
        ExpectedOperatorInitializer.instance.addOperator(ExpectedOperatorImplementation.greater);
        ExpectedOperatorInitializer.instance.addOperator(ExpectedOperatorImplementation.count);
        ExpectedOperatorInitializer.instance.addOperator(ExpectedOperatorImplementation.countEqualOrSmaller);
        ExpectedOperatorInitializer.instance.addOperator(ExpectedOperatorImplementation.countEqualOrGreater);
        ExpectedOperatorInitializer.instance.addOperator(ExpectedOperatorImplementation.empty);
        ExpectedOperatorInitializer.instance.addOperator(ExpectedOperatorImplementation.isArray);
        ExpectedOperatorInitializer.instance.addOperator(ExpectedOperatorImplementation.isObject);
        ExpectedOperatorInitializer.instance.addOperator(ExpectedOperatorImplementation.isNumber);
        ExpectedOperatorInitializer.instance.addOperator(ExpectedOperatorImplementation.isInt);
        ExpectedOperatorInitializer.instance.addOperator(ExpectedOperatorImplementation.isString);
        ExpectedOperatorInitializer.instance.addOperator(ExpectedOperatorImplementation.isNull);
    }
}
