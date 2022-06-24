import { DataContent } from '@boart/core';

import { ExpectedOperator } from './ExpectedOperator';
import { ExpectedOperatorInitializer } from './ExpectedOperatorInitializer';

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
    static get regexp(): ExpectedOperator {
        return {
            name: 'regexp',
            check: (value: DataContent, expectedValue: string): boolean => {
                const valueAsString = value.toString();
                const match = valueAsString.match(expectedValue);
                const matchedValue = !match ? '' : match[0];
                return valueAsString === matchedValue;
            }
        };
    }

    /**
     *
     */
    static get startsWith(): ExpectedOperator {
        return {
            name: 'startsWith',
            check: (value: DataContent, expectedValue: string): boolean => {
                const baseValue = value.getValue();
                return baseValue == null ? false : baseValue.toString().startsWith(expectedValue);
            }
        };
    }

    /**
     *
     */
    static get contains(): ExpectedOperator {
        return {
            name: 'contains',
            check: (value: DataContent, expectedValue: string): boolean => {
                const baseValue = value.getValue();

                if (baseValue == null) {
                    return false;
                } else if (Array.isArray(baseValue)) {
                    return Object.values(baseValue).includes(expectedValue);
                } else if (typeof baseValue === 'object') {
                    return Object.keys(baseValue).includes(expectedValue);
                } else if (typeof baseValue === 'string') {
                    return baseValue.includes(expectedValue);
                } else {
                    return false;
                }
            }
        };
    }

    /**
     *
     */
    private static getCount(value: DataContent, allowNumber = true): number {
        const baseValue = value.getValue();
        if (baseValue == null) {
            return 0;
        } else if (Array.isArray(baseValue)) {
            return Object.keys(baseValue).length;
        } else if (typeof baseValue === 'number' && allowNumber) {
            return baseValue;
        } else if (typeof baseValue === 'object') {
            return Object.keys(baseValue).length;
        } else if (typeof baseValue === 'string' && isNaN(parseInt(baseValue))) {
            return baseValue.length;
        } else if (typeof baseValue === 'string' && !isNaN(parseInt(baseValue))) {
            return parseInt(baseValue);
        } else {
            return Number.MIN_VALUE;
        }
    }

    /**
     *
     */
    static get smaller(): ExpectedOperator {
        return {
            name: 'smaller',
            check: (value: DataContent, expectedValue: string): boolean => {
                const valueLength = ExpectedOperatorImplementation.getCount(value);
                const expected = parseInt(expectedValue);
                return valueLength === Number.MIN_VALUE ? false : valueLength < expected;
            }
        };
    }

    /**
     *
     */
    static get greater(): ExpectedOperator {
        return {
            name: 'greater',
            check: (value: DataContent, expectedValue: string): boolean => {
                const valueLength = ExpectedOperatorImplementation.getCount(value);
                const expected = parseInt(expectedValue);
                return valueLength === Number.MIN_VALUE ? false : valueLength > expected;
            }
        };
    }

    /**
     *
     */
    static get count(): ExpectedOperator {
        return {
            name: 'count',
            check: (value: DataContent, expectedValue: string): boolean => {
                const valueLength = ExpectedOperatorImplementation.getCount(value, false);
                const expected = parseInt(expectedValue);
                return valueLength === Number.MIN_VALUE ? false : valueLength === expected;
            }
        };
    }

    /**
     *
     */
    static get countEqualOrGreater(): ExpectedOperator {
        return {
            name: 'count:equal-greater',
            check: (value: DataContent, expectedValue: string): boolean => {
                const valueLength = ExpectedOperatorImplementation.getCount(value, false);
                const expected = parseInt(expectedValue);
                return valueLength === Number.MIN_VALUE ? false : valueLength >= expected;
            }
        };
    }

    /**
     *
     */
    static get countEqualOrSmaller(): ExpectedOperator {
        return {
            name: 'count:equal-smaller',
            check: (value: DataContent, expectedValue: string): boolean => {
                const valueLength = ExpectedOperatorImplementation.getCount(value, false);
                const expected = parseInt(expectedValue);
                return valueLength === Number.MIN_VALUE ? false : valueLength <= expected;
            }
        };
    }

    /**
     *
     */
    static get empty(): ExpectedOperator {
        return {
            name: 'empty',
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            check: (value: DataContent, _: string): boolean => {
                const valueLength = ExpectedOperatorImplementation.getCount(value, false);
                return valueLength === Number.MIN_VALUE ? false : valueLength === 0;
            }
        };
    }

    /**
     *
     */
    static get isArray(): ExpectedOperator {
        return {
            name: 'array',
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            check: (value: DataContent, _: string): boolean => {
                const baseValue = value.getValue();
                return Array.isArray(baseValue);
            }
        };
    }

    /**
     *
     */
    static get isObject(): ExpectedOperator {
        return {
            name: 'object',
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            check: (value: DataContent, _: string): boolean => {
                const baseValue = value.getValue();
                return !!baseValue && !Array.isArray(baseValue) && typeof baseValue === 'object';
            }
        };
    }

    /**
     *
     */
    static get isNumber(): ExpectedOperator {
        return {
            name: 'mumber',
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            check: (value: DataContent, _: string): boolean => {
                const baseValue = value.toString();
                return !isNaN(parseInt(baseValue));
            }
        };
    }

    /**
     *
     */
    static get isNull(): ExpectedOperator {
        return {
            name: 'null',
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            check: (value: DataContent, _: string): boolean => {
                return value.getValue() == null;
            }
        };
    }

    /**
     *
     */
    static addAll(): void {
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
        ExpectedOperatorInitializer.instance.addOperator(ExpectedOperatorImplementation.isNull);
    }
}
