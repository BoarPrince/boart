import { DataContent } from '@boart/core';

import { IntValidator } from '../../validators/IntValidator';

import { ExpectedOperator, ExpectedOperatorResult } from './ExpectedOperator';
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
            check: (value: DataContent, expectedValue: string): ExpectedOperatorResult => {
                const valueAsString = value.toString();
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
            check: (value: DataContent, expectedValue: string): ExpectedOperatorResult => {
                const baseValue = value.getValue();
                return {
                    result: baseValue == null ? false : baseValue.toString().startsWith(expectedValue)
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
            check: (value: DataContent, expectedValue: string): ExpectedOperatorResult => {
                const baseValue = value.getValue();
                const negativeResult = {
                    result: false
                };

                if (baseValue == null) {
                    return negativeResult;
                } else if (Array.isArray(baseValue)) {
                    return {
                        result: Object.values(baseValue).includes(expectedValue)
                    };
                } else if (typeof baseValue === 'object') {
                    return {
                        result: Object.keys(baseValue).includes(expectedValue)
                    };
                } else if (typeof baseValue === 'string') {
                    return {
                        result: baseValue.includes(expectedValue)
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
    private static getCount(value: DataContent, allowNumber = true): { key?: string; length: number } {
        const baseValue = value.getValue();
        if (baseValue == null) {
            return {
                length: 0
            };
        } else if (Array.isArray(baseValue)) {
            const arrayKeys = Object.keys(baseValue);
            return {
                key: `indexes: '${arrayKeys.join(',')}'`,
                length: arrayKeys.length
            };
        } else if (typeof baseValue === 'number' && allowNumber) {
            return {
                length: baseValue
            };
        } else if (typeof baseValue === 'object') {
            const objectKeys = Object.keys(baseValue);
            return {
                key: `keys: '${objectKeys.join(',')}'`,
                length: objectKeys.length
            };
        } else if (typeof baseValue === 'string' && isNaN(parseInt(baseValue))) {
            return {
                length: baseValue.length
            };
        } else if (typeof baseValue === 'string' && !isNaN(parseInt(baseValue))) {
            return {
                length: parseInt(baseValue)
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
            check: (value: DataContent, expectedValue: string): ExpectedOperatorResult => {
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
            check: (value: DataContent, expectedValue: string): ExpectedOperatorResult => {
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
            check: (value: DataContent, expectedValue: string): ExpectedOperatorResult => {
                const count = ExpectedOperatorImplementation.getCount(value, false);
                const expected = parseInt(expectedValue);
                return {
                    result: count.length === Number.MIN_VALUE ? false : count.length === expected,
                    errorMessage: `, value: ${expectedValue}, actual: ${count.key || ''}`
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
            check: (value: DataContent, expectedValue: string): ExpectedOperatorResult => {
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
            check: (value: DataContent, expectedValue: string): ExpectedOperatorResult => {
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
            check: (value: DataContent): ExpectedOperatorResult => {
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
            check: (value: DataContent): ExpectedOperatorResult => {
                const baseValue = value.getValue();
                return {
                    result: Array.isArray(baseValue)
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
            check: (value: DataContent): ExpectedOperatorResult => {
                const baseValue = value.getValue();
                return {
                    result: !!baseValue && !Array.isArray(baseValue) && typeof baseValue === 'object'
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
            check: (value: DataContent): ExpectedOperatorResult => {
                const baseValue = value.toString();
                return {
                    result: !isNaN(parseInt(baseValue))
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
            check: (value: DataContent): ExpectedOperatorResult => {
                return {
                    result: value.getValue() == null,
                    errorMessage: `, null: actual: '${value.getText()}'`
                };
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