import { DescriptionHandler, ExpectedOperator, ExpectedOperatorInitializer, ExpectedOperatorResult, NativeType } from '@boart/core';

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
    private static parseInt(value: NativeType): number {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        const valueAsString: string = value?.toString();

        const numberRegexp = /^\s*-?\s*[.,0-9]+$/;
        if (numberRegexp.test(valueAsString) && !isNaN(parseInt(valueAsString))) {
            return parseInt(valueAsString);
        }

        if (!isNaN(Date.parse(valueAsString))) {
            return Date.parse(valueAsString);
        }

        return NaN;
    }

    /**
     *
     */
    static get equals(): ExpectedOperator {
        return {
            name: 'equals',
            description: () => DescriptionHandler.readDescription('expected.desc', 'expected:equals'),
            default: true,
            caseInsesitive: true,
            check: (value: NativeType, expectedValue: string): ExpectedOperatorResult => ({
                result: ExpectedOperatorImplementation.valueToString(expectedValue) == ExpectedOperatorImplementation.valueToString(value),
                errorMessage: `\n\texpected: ${ExpectedOperatorImplementation.valueToString(
                    expectedValue
                )}\n\tactual: ${ExpectedOperatorImplementation.valueToString(value)}`
            })
        };
    }

    /**
     *
     */
    static get regexp(): ExpectedOperator {
        return {
            name: 'regexp',
            description: () => DescriptionHandler.readDescription('expected.desc', 'expected:regexp'),
            caseInsesitive: false,
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
            description: () => DescriptionHandler.readDescription('expected.desc', 'expected:startsWith'),
            caseInsesitive: true,
            check: (value: NativeType, expectedValue: string): ExpectedOperatorResult => {
                return {
                    // eslint-disable-next-line @typescript-eslint/no-base-to-string
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
            description: () => DescriptionHandler.readDescription('expected.desc', 'expected:contains'),
            caseInsesitive: true,
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
            caseInsesitive: true,
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
        } else if (typeof value === 'string' && isNaN(ExpectedOperatorImplementation.parseInt(value))) {
            return {
                length: value.length
            };
        } else if (typeof value === 'string' && !isNaN(ExpectedOperatorImplementation.parseInt(value))) {
            return {
                length: ExpectedOperatorImplementation.parseInt(value)
            };
        } else if (typeof value === 'string' && !isNaN(Date.parse(value))) {
            return {
                length: Date.parse(value)
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
            caseInsesitive: false,
            check: (value: NativeType, expectedValue: string): ExpectedOperatorResult => {
                const count = ExpectedOperatorImplementation.getCount(value);
                const expected = ExpectedOperatorImplementation.parseInt(expectedValue);
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
            caseInsesitive: false,
            check: (value: NativeType, expectedValue: string): ExpectedOperatorResult => {
                const count = ExpectedOperatorImplementation.getCount(value);
                const expected = ExpectedOperatorImplementation.parseInt(expectedValue);
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
            caseInsesitive: false,
            check: (value: NativeType, expectedValue: string): ExpectedOperatorResult => {
                const count = ExpectedOperatorImplementation.getCount(value, false);
                const expected = ExpectedOperatorImplementation.parseInt(expectedValue);
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
            caseInsesitive: false,
            check: (value: NativeType, expectedValue: string): ExpectedOperatorResult => {
                const count = ExpectedOperatorImplementation.getCount(value, false);
                const expected = ExpectedOperatorImplementation.parseInt(expectedValue);
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
            caseInsesitive: false,
            check: (value: NativeType, expectedValue: string): ExpectedOperatorResult => {
                const count = ExpectedOperatorImplementation.getCount(value, false);
                const expected = ExpectedOperatorImplementation.parseInt(expectedValue);
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
            caseInsesitive: false,
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
            caseInsesitive: false,
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
            caseInsesitive: false,
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
            caseInsesitive: false,
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
            caseInsesitive: false,
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
            caseInsesitive: false,
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
            caseInsesitive: false,
            check: (value: NativeType): ExpectedOperatorResult => {
                return {
                    result: value?.valueOf() == null,
                    // eslint-disable-next-line @typescript-eslint/no-base-to-string
                    errorMessage: `, null: actual: '${(value ?? '').toString()}'`
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
        ExpectedOperatorInitializer.instance.addOperator(ExpectedOperatorImplementation.containsKey);
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
