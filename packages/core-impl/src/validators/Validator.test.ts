/* eslint-disable @typescript-eslint/no-explicit-any */
import { GroupValidator, ParaType, RowValidator } from '@boart/core';
import { AnyBaseRowType } from '@boart/core/src/table/BaseRowType';
import { ValidationHandler } from '@boart/core/src/Validators/ValidationHandler';
import { BoolValidator } from './BoolValidator';
import { DependsOnValidator } from './DependsOnValidator';
import { IntValidator } from './IntValidator';
import { ParaValidator } from './ParaValidator';
import { RequiredValidator } from './RequiredValidator';
import { UniqueValidator } from './UniqueValidator';
import { XORValidator } from './XORValidator';

describe('check row validators', () => {
    /**
     *
     */
    describe('check basic ValidationHandler functionality', () => {
        /**
         *
         */
        class GroupingValidator implements GroupValidator {
            name = 'GroupValidatorMock';
            validate() {
                /* do noting */
            }
        }

        /**
         *
         */
        it('check if row validator list is null, no error shall occur', () => {
            const sut = new ValidationHandler(null);
            const rowData: AnyBaseRowType = {
                data: {
                    key: 'a:a',
                    keyPara: null,
                    values: {
                        value1: 'a'
                    },
                    values_replaced: {
                        value1: 'a'
                    },
                    _metaDefinition: {
                        key: null,
                        type: null,
                        executionUnit: null,
                        parameterType: ParaType.False,
                        validators: null
                    }
                }
            };

            sut.validate([rowData]);
        });
    });

    /**
     *
     */
    describe('check bool validator', () => {
        /**
         *
         */
        class DoNotingValidator implements RowValidator {
            validate() {
                // only for checking if a list of validators is working too.
            }
        }

        /**
         *
         */
        it.each([
            [true, true],
            ['true', true],
            ['True', true],
            ['TRUE', true],
            [false, false],
            ['false', false],
            ['False', false],
            ['FALSE', false]
        ])(`check bool validator (value: '%s', expected: '%s'`, (value: string | boolean, exptectedValue: boolean) => {
            const sut = new ValidationHandler(null);
            const rowData: AnyBaseRowType = {
                data: {
                    key: 'a:a',
                    keyPara: null,
                    values: {
                        value1: value
                    },
                    values_replaced: {
                        value1: value
                    },
                    _metaDefinition: {
                        key: null,
                        type: null,
                        executionUnit: null,
                        parameterType: ParaType.False,
                        validators: [new BoolValidator('value1'), new DoNotingValidator()]
                    }
                }
            };

            sut.validate([rowData]);
            expect(typeof rowData.data.values.value1).toBe('boolean');
            expect(rowData.data.values.value1).toBe(exptectedValue);
        });

        /**
         *
         */
        it.each([
            ['true', 'value', `Validator: 'BoolValidator' => column 'value' is not defined`],
            ['true', '', `Validator: 'BoolValidator' => column '' is not defined`],
            ['true', null, `Validator: 'BoolValidator' => column 'null' is not defined`],
            ['tru', 'value1', `column 'value1' must be a boolean value, but is 'tru'`],
            ['', 'value1', `column 'value1' must be a boolean value, but is ''`],
            [0, 'value1', `column 'value1' must be a boolean value, but is '0'`],
            [1, 'value1', `column 'value1' must be a boolean value, but is '1'`]
        ])(
            `check bool validator failure handling (value: '%s', column name: '%s', expected message: '%s'`,
            (value: string | number, columnName: string, expectedMessage: string) => {
                const sut = new ValidationHandler(null);
                const rowData: AnyBaseRowType = {
                    data: {
                        key: 'a:a',
                        keyPara: null,
                        values: {
                            value1: value
                        },
                        values_replaced: {
                            value1: value
                        },
                        _metaDefinition: {
                            key: null,
                            type: null,
                            executionUnit: null,
                            parameterType: ParaType.False,
                            validators: [new BoolValidator(columnName)]
                        }
                    }
                };

                try {
                    sut.validate([rowData]);
                } catch (error) {
                    expect(error.message).toBe(expectedMessage);
                    return;
                }

                throw Error('error must be thrown when any failures occurs during bool valiation');
            }
        );
    });

    /**
     *
     */
    describe('check int validator', () => {
        /**
         *
         */
        it.each([
            ['1', 1],
            [1, 1],
            ['10', 10],
            ['01', 1],
            ['0', 0]
        ])(`check int validator (value: '%s', expected: '%s'`, (value: string | number, exptectedValue: number) => {
            const sut = new ValidationHandler(null);
            const rowData: AnyBaseRowType = {
                data: {
                    key: 'a:a',
                    keyPara: null,
                    values: {
                        value1: value
                    },
                    values_replaced: {
                        value1: value
                    },
                    _metaDefinition: {
                        key: null,
                        type: null,
                        executionUnit: null,
                        parameterType: ParaType.False,
                        validators: [new IntValidator('value1')]
                    }
                }
            };

            sut.validate([rowData]);
            expect(typeof rowData.data.values.value1).toBe('number');
            expect(rowData.data.values.value1).toBe(exptectedValue);
        });

        /**
         *
         */
        it.each([
            ['1', 'value', `Validator: 'IntValidator' => column 'value' is not defined`],
            ['true', 'value1', `column 'value1' must be a integer (number) value, but is 'true'`],
            ['0,1', 'value1', `column 'value1' must be a integer (number) value, but is '0,1'`],
            ['0.1', 'value1', `column 'value1' must be a integer (number) value, but is '0.1'`],
            ['', 'value1', `column 'value1' must be a integer (number) value, but is ''`],
            [null, 'value1', `column 'value1' must be a integer (number) value, but is 'null'`],
            [undefined, 'value1', `column 'value1' must be a integer (number) value, but is 'undefined'`]
        ])(
            `check int validator failure handling (value: '%s', column name: '%s', expected message: '%s'`,
            (value: string, columnName: string, expectedMessage: string) => {
                const sut = new ValidationHandler(null);
                const rowData: AnyBaseRowType = {
                    data: {
                        key: 'a:a',
                        keyPara: null,
                        values: {
                            value1: value
                        },
                        values_replaced: {
                            value1: value
                        },
                        _metaDefinition: {
                            key: null,
                            type: null,
                            executionUnit: null,
                            parameterType: ParaType.False,
                            validators: [new IntValidator(columnName)]
                        }
                    }
                };

                try {
                    sut.validate([rowData]);
                } catch (error) {
                    expect(error.message).toBe(expectedMessage);
                    return;
                }

                throw Error('error must be thrown when any failures occurs during int valiation');
            }
        );
    });

    /**
     *
     */
    describe('check dependsOn validator', () => {
        /**
         *
         */
        it('check happy path', () => {
            const sut = new ValidationHandler(null);
            const rowData: AnyBaseRowType = {
                data: {
                    key: 'a:a',
                    keyPara: null,
                    values: {
                        value1: null
                    },
                    values_replaced: {
                        value1: null
                    },
                    _metaDefinition: {
                        key: Symbol('a:a'),
                        type: null,
                        executionUnit: null,
                        parameterType: ParaType.False,
                        validators: [new DependsOnValidator(Symbol('b:b'))]
                    }
                }
            };

            const dependentRow: AnyBaseRowType = {
                data: {
                    key: 'b:b',
                    keyPara: null,
                    values: {
                        value1: null
                    },
                    values_replaced: {
                        value1: null
                    },
                    _metaDefinition: {
                        key: null,
                        type: null,
                        executionUnit: null,
                        parameterType: ParaType.False,
                        validators: null
                    }
                }
            };

            sut.validate([rowData, dependentRow]);
        });

        /**
         *
         */
        it('check failure', () => {
            const sut = new ValidationHandler(null);
            const rowData: AnyBaseRowType = {
                data: {
                    key: 'a:a',
                    keyPara: null,
                    values: {
                        value1: null
                    },
                    values_replaced: {
                        value1: null
                    },
                    _metaDefinition: {
                        key: Symbol('a:a'),
                        type: null,
                        executionUnit: null,
                        parameterType: ParaType.False,
                        validators: [new DependsOnValidator(Symbol('c:c'))]
                    }
                }
            };

            const dependentRow: AnyBaseRowType = {
                data: {
                    key: 'b:b',
                    keyPara: null,
                    values: {
                        value1: null
                    },
                    values_replaced: {
                        value1: null
                    },
                    _metaDefinition: {
                        key: null,
                        type: null,
                        executionUnit: null,
                        parameterType: ParaType.False,
                        validators: null
                    }
                }
            };

            try {
                sut.validate([rowData, dependentRow]);
            } catch (error) {
                expect(error.message).toBe(`key 'a:a' depends on 'c:c', but it does not exist!`);
                return;
            }

            throw Error(`error must be thrown if dependOn validate fails`);
        });
    });

    /**
     *
     */
    describe('check xor validator', () => {
        /**
         *
         */
        it('check name', () => {
            const sut = new XORValidator(null);
            expect(sut.name).toBe('XORValidator');
        });

        /**
         *
         */
        it.each([
            [[Symbol('a:1')], null], //
            [[Symbol('a:2')], null],
            [[Symbol('a:3')], null],
            [[Symbol('a:3'), Symbol('a:4'), Symbol('a:5')], null],
            [[Symbol('a:1'), Symbol('a:2')], `Exactly one of the keys 'a:1, a:2' must exists, but 'a:1, a:2' exists`], //
            [[Symbol('a:4'), Symbol('a:5')], `One of the following keys 'a:4, a:5' must exists, but no one exists`] //
        ])(`check xor happy path (keys: '%s', error message: 's'`, (keys: symbol[], errorMessage: string) => {
            const sut = new ValidationHandler([new XORValidator(keys)]);
            const rowData: AnyBaseRowType[] = [
                {
                    data: {
                        key: 'a:1',
                        keyPara: null,
                        values: {
                            value1: null
                        },
                        values_replaced: {
                            value1: null
                        },
                        _metaDefinition: {
                            key: null,
                            type: null,
                            executionUnit: null,
                            parameterType: ParaType.False,
                            validators: []
                        }
                    }
                },
                {
                    data: {
                        key: 'a:2',
                        keyPara: null,
                        values: {
                            value1: null
                        },
                        values_replaced: {
                            value1: null
                        },
                        _metaDefinition: {
                            key: null,
                            type: null,
                            executionUnit: null,
                            parameterType: ParaType.False,
                            validators: []
                        }
                    }
                },
                {
                    data: {
                        key: 'a:3',
                        keyPara: null,
                        values: {
                            value1: null
                        },
                        values_replaced: {
                            value1: null
                        },
                        _metaDefinition: {
                            key: null,
                            type: null,
                            executionUnit: null,
                            parameterType: ParaType.False,
                            validators: []
                        }
                    }
                }
            ];

            if (!errorMessage) {
                sut.validate(rowData);
            } else {
                try {
                    sut.validate(rowData);
                } catch (error) {
                    expect(error.message).toBe(errorMessage);
                    return;
                }

                throw Error(`Error must be thrown if XOR validator should detect a problem`);
            }
        });
    });

    /**
     *
     */
    describe('check required validator', () => {
        /**
         *
         */
        it('check name', () => {
            const sut = new RequiredValidator(null);
            expect(sut.name).toBe('RequiredValidator');
        });

        /**
         *
         */
        it.each([
            [[Symbol('a:1')], null], //
            [[Symbol('a:2')], null],
            [[Symbol('a:3')], null],
            [[Symbol('a:3'), Symbol('a:4'), Symbol('a:5')], `Key 'a:4' is required, but it's missing`],
            [[Symbol('a:1'), Symbol('a:2')], null], //
            [[Symbol('a:4'), Symbol('a:5')], `Key 'a:4' is required, but it's missing`] //
        ])(`check required happy path (keys: '%s', error message: 's'`, (keys: symbol[], errorMessage: string) => {
            const sut = new ValidationHandler([new RequiredValidator(keys)]);
            const rowData: AnyBaseRowType[] = [
                {
                    data: {
                        key: 'a:1',
                        keyPara: null,
                        values: {
                            value1: null
                        },
                        values_replaced: {
                            value1: null
                        },
                        _metaDefinition: {
                            key: null,
                            type: null,
                            executionUnit: null,
                            parameterType: ParaType.False,
                            validators: []
                        }
                    }
                },
                {
                    data: {
                        key: 'a:2',
                        keyPara: null,
                        values: {
                            value1: null
                        },
                        values_replaced: {
                            value1: null
                        },
                        _metaDefinition: {
                            key: null,
                            type: null,
                            executionUnit: null,
                            parameterType: ParaType.False,
                            validators: []
                        }
                    }
                },
                {
                    data: {
                        key: 'a:3',
                        keyPara: null,
                        values: {
                            value1: null
                        },
                        values_replaced: {
                            value1: null
                        },
                        _metaDefinition: {
                            key: null,
                            type: null,
                            executionUnit: null,
                            parameterType: ParaType.False,
                            validators: []
                        }
                    }
                }
            ];

            if (!errorMessage) {
                sut.validate(rowData);
            } else {
                try {
                    sut.validate(rowData);
                } catch (error) {
                    expect(error.message).toBe(errorMessage);
                    return;
                }

                throw Error(`Error must be thrown if XOR validator should detect a problem`);
            }
        });
    });

    /**
     *
     */
    describe('check unique validator', () => {
        it.each([
            [Symbol('a:1'), Symbol('a:2'), null], //
            [Symbol('a:1'), Symbol('a:1'), `Validator: 'UniqueValidator' => key 'a:1' occurs 2 times`]
        ])(`check xor happy path (keys: '%s', error message: 's'`, (key1: symbol, key2: symbol, errorMessage: string) => {
            const sut = new ValidationHandler(null);
            const rowData: AnyBaseRowType[] = [
                {
                    data: {
                        key: key1.description,
                        keyPara: null,
                        values: {
                            value1: null
                        },
                        values_replaced: {
                            value1: null
                        },
                        _metaDefinition: {
                            key: null,
                            type: null,
                            executionUnit: null,
                            parameterType: ParaType.False,
                            validators: [new UniqueValidator()]
                        }
                    }
                },
                {
                    data: {
                        key: key2.description,
                        keyPara: null,
                        values: {
                            value1: null
                        },
                        values_replaced: {
                            value1: null
                        },
                        _metaDefinition: {
                            key: null,
                            type: null,
                            executionUnit: null,
                            parameterType: ParaType.False,
                            validators: [new UniqueValidator()]
                        }
                    }
                }
            ];

            if (!errorMessage) {
                sut.validate(rowData);
            } else {
                try {
                    sut.validate(rowData);
                } catch (error) {
                    expect(error.message).toBe(errorMessage);
                    return;
                }

                throw Error(`Error must be thrown if XOR validator should detect a problem`);
            }
        });
    });

    /**
     *
     */
    describe('check para validator', () => {
        it.each([
            [Symbol('out'), null, [''], null], //
            [Symbol('out'), '', [''], null], //
            [Symbol('out'), '', [null], null], //
            [Symbol('out'), '', ['', 'store'], null],
            [Symbol('out'), 'store', ['', 'store'], null],
            [Symbol('out'), 'store', ['', 'global'], `Parameter 'store' is not defined`]
        ])(
            `check para validation (metaKey: '%s', key: '%s', allowed Paras: '%s', error message: '%s'`,
            (key: symbol, para: string, allowedParas: string[], errorMessage: string) => {
                const sut = new ValidationHandler(null);
                const rowData: AnyBaseRowType[] = [
                    {
                        data: {
                            key: key.description,
                            keyPara: para,
                            values: {
                                value1: null
                            },
                            values_replaced: {
                                value1: null
                            },
                            _metaDefinition: {
                                key: null,
                                type: null,
                                executionUnit: null,
                                parameterType: null,
                                validators: [new ParaValidator(allowedParas)]
                            }
                        }
                    }
                ];

                if (!errorMessage) {
                    sut.validate(rowData);
                } else {
                    try {
                        sut.validate(rowData);
                    } catch (error) {
                        expect(error.message).toBe(errorMessage);
                        return;
                    }

                    throw Error(`Error must be thrown if para validator should detect a problem`);
                }
            }
        );
    });
});
