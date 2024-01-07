import { BaseRowType, GroupValidator, ParaType, RowDefinition, RowValidator, ValidationHandler, VariableParser } from '@boart/core';

import { BoolValidator } from './BoolValidator';
import { DependsOnValidator } from './DependsOnValidator';
import { IntValidator } from './IntValidator';
import { QualifierValidator, ValidatorDefinition } from './QualifierValidator';
import { RequiredValidator } from './RequiredValidator';
import { UniqueValidator } from './UniqueValidator';
import { ValueRequiredValidator } from './ValueRequiredValidator';
import { XORValidator } from './XORValidator';

/**
 *
 */
describe('check row validators', () => {
    const variableParser = new VariableParser();
    const astAA = variableParser.parseAction('a:a');
    const astBB = variableParser.parseAction('b:b');
    const astA1 = variableParser.parseAction('a:1');
    const astA2 = variableParser.parseAction('a:2');
    const astA3 = variableParser.parseAction('a:3');

    /**
     *
     */
    describe('check basic ValidationHandler functionality', () => {
        /**
         *
         */
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

            const rowData: BaseRowType<null> = {
                data: {
                    ast: astAA,
                    values_replaced: {
                        value1: 'a'
                    },
                    _metaDefinition: new RowDefinition({
                        key: null,
                        type: null,
                        selectorType: null,
                        executionUnit: null,
                        parameterType: ParaType.False,
                        validators: null
                    })
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
            const rowData: BaseRowType<null> = {
                data: {
                    ast: astAA,
                    values_replaced: {
                        value1: value
                    },
                    _metaDefinition: new RowDefinition({
                        key: null,
                        type: null,
                        selectorType: null,
                        executionUnit: null,
                        parameterType: ParaType.False,
                        validators: [new BoolValidator('value1'), new DoNotingValidator()]
                    })
                }
            };

            sut.validate([rowData]);
            expect(typeof rowData.data.values_replaced.value1).toBe('boolean');
            expect(rowData.data.values_replaced.value1).toBe(exptectedValue);
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
                const rowData: BaseRowType<null> = {
                    data: {
                        ast: astAA,
                        values_replaced: {
                            value1: value
                        },
                        _metaDefinition: new RowDefinition({
                            key: null,
                            type: null,
                            selectorType: null,
                            executionUnit: null,
                            parameterType: ParaType.False,
                            validators: [new BoolValidator(columnName)]
                        })
                    }
                };

                expect(() => sut.validate([rowData])).toThrow(expectedMessage);
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
            const rowData: BaseRowType<null> = {
                data: {
                    ast: astAA,
                    values_replaced: {
                        value1: value
                    },
                    _metaDefinition: new RowDefinition({
                        key: null,
                        type: null,
                        selectorType: null,
                        executionUnit: null,
                        parameterType: ParaType.False,
                        validators: [new IntValidator('value1')]
                    })
                }
            };

            sut.validate([rowData]);
            expect(typeof rowData.data.values_replaced.value1).toBe('number');
            expect(rowData.data.values_replaced.value1).toBe(exptectedValue);
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
                const rowData: BaseRowType<null> = {
                    data: {
                        ast: astAA,
                        values_replaced: {
                            value1: value
                        },
                        _metaDefinition: new RowDefinition({
                            key: null,
                            type: null,
                            selectorType: null,
                            executionUnit: null,
                            parameterType: ParaType.False,
                            validators: [new IntValidator(columnName)]
                        })
                    }
                };

                expect(() => sut.validate([rowData])).toThrow(expectedMessage);
            }
        );

        /**
         *
         */
        it('allow null', () => {
            const sut = new IntValidator('value1', true);
            sut.validate({
                ast: astAA,
                values_replaced: {
                    value1: null
                },
                _metaDefinition: new RowDefinition({
                    key: null,
                    type: null,
                    selectorType: null,
                    executionUnit: null,
                    parameterType: ParaType.False,
                    validators: []
                })
            });
        });
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
            const rowData: BaseRowType<null> = {
                data: {
                    ast: astAA,
                    values_replaced: {
                        value1: null
                    },
                    _metaDefinition: new RowDefinition({
                        key: Symbol('a:a'),
                        type: null,
                        selectorType: null,
                        executionUnit: null,
                        parameterType: ParaType.False,
                        validators: [new DependsOnValidator(['b:b'])]
                    })
                }
            };

            const dependentRow: BaseRowType<null> = {
                data: {
                    ast: astBB,
                    values_replaced: {
                        value1: null
                    },
                    _metaDefinition: new RowDefinition({
                        key: null,
                        type: null,
                        selectorType: null,
                        executionUnit: null,
                        parameterType: ParaType.False,
                        validators: null
                    })
                }
            };

            sut.validate([rowData, dependentRow]);
        });

        /**
         *
         */
        it('check failure', () => {
            const sut = new ValidationHandler(null);
            const rowData: BaseRowType<null> = {
                data: {
                    ast: astAA,
                    values_replaced: {
                        value1: null
                    },
                    _metaDefinition: new RowDefinition({
                        key: Symbol('a:a'),
                        type: null,
                        selectorType: null,
                        executionUnit: null,
                        parameterType: ParaType.False,
                        validators: [new DependsOnValidator(['c:c'])]
                    })
                }
            };

            const dependentRow: BaseRowType<null> = {
                data: {
                    ast: astBB,
                    values_replaced: {
                        value1: null
                    },
                    _metaDefinition: new RowDefinition({
                        key: null,
                        type: null,
                        selectorType: null,
                        executionUnit: null,
                        parameterType: ParaType.False,
                        validators: null
                    })
                }
            };

            expect(() => sut.validate([rowData, dependentRow])).toThrow(`key 'a:a' depends on 'c:c', but it does not exist!`);
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
            [[Symbol('a:1'), Symbol('a:2')], `Only one of the keys 'a:1 or a:2' must exists, but 'a:1 and a:2' exists`], //
            [[Symbol('a:4'), Symbol('a:5')], `One of the following keys 'a:4, a:5' must exists, but no one exists`] //
        ])(`check xor happy path (keys: '%s', error message: 's'`, (keys: symbol[], errorMessage: string) => {
            const sut = new ValidationHandler([new XORValidator(keys)]);
            const rowData: BaseRowType<null>[] = [
                {
                    data: {
                        ast: astA1,
                        values_replaced: {
                            value1: null
                        },
                        _metaDefinition: new RowDefinition({
                            key: null,
                            type: null,
                            selectorType: null,
                            executionUnit: null,
                            parameterType: ParaType.False,
                            validators: []
                        })
                    }
                },
                {
                    data: {
                        ast: astA2,
                        values_replaced: {
                            value1: null
                        },
                        _metaDefinition: new RowDefinition({
                            key: null,
                            type: null,
                            selectorType: null,
                            executionUnit: null,
                            parameterType: ParaType.False,
                            validators: []
                        })
                    }
                },
                {
                    data: {
                        ast: astA3,
                        values_replaced: {
                            value1: null
                        },
                        _metaDefinition: new RowDefinition({
                            key: null,
                            type: null,
                            selectorType: null,
                            executionUnit: null,
                            parameterType: ParaType.False,
                            validators: []
                        })
                    }
                }
            ];

            // eslint-disable-next-line jest/no-conditional-in-test
            if (!errorMessage) {
                sut.validate(rowData);
            } else {
                // eslint-disable-next-line jest/no-conditional-expect
                expect(() => sut.validate(rowData)).toThrow(errorMessage);
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
            const rowData: BaseRowType<null>[] = [
                {
                    data: {
                        ast: astA1,
                        values_replaced: {
                            value1: null
                        },
                        _metaDefinition: new RowDefinition({
                            key: null,
                            type: null,
                            selectorType: null,
                            executionUnit: null,
                            parameterType: ParaType.False,
                            validators: []
                        })
                    }
                },
                {
                    data: {
                        ast: astA2,
                        values_replaced: {
                            value1: null
                        },
                        _metaDefinition: new RowDefinition({
                            key: null,
                            type: null,
                            selectorType: null,
                            executionUnit: null,
                            parameterType: ParaType.False,
                            validators: []
                        })
                    }
                },
                {
                    data: {
                        ast: astA3,
                        values_replaced: {
                            value1: null
                        },
                        _metaDefinition: new RowDefinition({
                            key: null,
                            type: null,
                            selectorType: null,
                            executionUnit: null,
                            parameterType: ParaType.False,
                            validators: []
                        })
                    }
                }
            ];

            // eslint-disable-next-line jest/no-conditional-in-test
            if (!errorMessage) {
                sut.validate(rowData);
            } else {
                // eslint-disable-next-line jest/no-conditional-expect
                expect(() => sut.validate(rowData)).toThrow(errorMessage);
            }
        });
    });

    /**
     *
     */
    describe('check unique validator', () => {
        /**
         *
         */
        it.each([
            [Symbol('a:1'), Symbol('a:2'), null], //
            [Symbol('a:1'), Symbol('a:1'), `Validator: 'UniqueValidator' => key 'a:1' occurs 2 times`]
        ])(`check xor happy path (keys: '%s', error message: 's'`, (key1: symbol, key2: symbol, errorMessage: string) => {
            const sut = new ValidationHandler(null);
            const rowData: BaseRowType<null>[] = [
                {
                    data: {
                        ast: variableParser.parseAction(key1.description),
                        values_replaced: {
                            value1: null
                        },
                        _metaDefinition: new RowDefinition({
                            key: null,
                            type: null,
                            selectorType: null,
                            executionUnit: null,
                            parameterType: ParaType.False,
                            validators: [new UniqueValidator()]
                        })
                    }
                },
                {
                    data: {
                        ast: variableParser.parseAction(key2.description),
                        values_replaced: {
                            value1: null
                        },
                        _metaDefinition: new RowDefinition({
                            key: null,
                            type: null,
                            selectorType: null,
                            executionUnit: null,
                            parameterType: ParaType.False,
                            validators: [new UniqueValidator()]
                        })
                    }
                }
            ];

            // eslint-disable-next-line jest/no-conditional-in-test
            if (!errorMessage) {
                sut.validate(rowData);
            } else {
                // eslint-disable-next-line jest/no-conditional-expect
                expect(() => sut.validate(rowData)).toThrow(errorMessage);
            }
        });
    });

    /**
     *
     */
    describe('check qualifier validator', () => {
        /**
         *
         */
        it.each([
            [1, Symbol('out'), [''], null], //
            [2, Symbol('out'), [''], null], //
            [3, Symbol('out'), [null], null], //
            [4, Symbol('out'), ['', 'store'], null],
            [5, Symbol('out'), [null, '', 'store'], null],
            [6, Symbol('out:store'), ['store'], null],
            [7, Symbol('out:store'), ['', 'global'], "Qualifier 'store' of action 'out:store' is not defined. Allowed is '' or 'global'"],
            [8, Symbol('out:store'), [null, 'global'], "Qualifier 'store' of action 'out:store' is not defined. Allowed is '' or 'global'"],
            [9, Symbol('out:store'), [null], "Qualifier 'store' of action 'out:store' is not defined. Allowed is ''"],
            [10, Symbol('out:store'), null, "Qualifier 'store' of action 'out:store' is not defined. Allowed is ''"]
        ])(
            `%s: check qualifier validation (metaKey: '%s', key: '%s', allowed Paras: '%s', error message: '%s'`,
            (nr: number, key: symbol, allowedParas: string[], errorMessage: string) => {
                const sut = new ValidationHandler(null);
                const qualifierParaDef = allowedParas?.map((para) => ({ qualifier: para, paras: null }));
                const rowData: BaseRowType<null>[] = [
                    {
                        data: {
                            ast: variableParser.parseAction(key.description),
                            values_replaced: {
                                value1: null
                            },
                            _metaDefinition: new RowDefinition({
                                key: null,
                                type: null,
                                selectorType: null,
                                executionUnit: null,
                                parameterType: null,
                                validators: [new QualifierValidator(qualifierParaDef)]
                            })
                        }
                    }
                ];

                // eslint-disable-next-line jest/no-conditional-in-test
                if (!errorMessage) {
                    sut.validate(rowData);
                } else {
                    // eslint-disable-next-line jest/no-conditional-expect
                    expect(() => sut.validate(rowData)).toThrow(errorMessage);
                }
            }
        );

        /**
         *
         */
        it.each([
            [1, Symbol('out'), [{ qualifier: 'store' }, { qualifier: '' }]],
            [2, Symbol('out:store'), [{ qualifier: 'store', paras: ['para1', ''] }, { qualifier: '' }]],
            [3, Symbol('out:store:para1'), [{ qualifier: 'store', paras: ['para1'] }]],
            [4, Symbol('out:store:para1'), [{ qualifier: 'store', paras: ['para1', ''] }]],
            [5, Symbol('out:store:para1:para2'), [{ qualifier: 'store', paras: ['para1', 'para1:para2'] }]],
            [6, Symbol('expected:op3:not'), [{ qualifier: 'op3', paras: ['not', ''] }]]
        ])(
            `%s: check qualifier validation with paras - no error - metaKey: '%s', key: '%s', allowed Paras: '%s', error message: '%s'`,
            (nr: number, key: symbol, validatorDef: ValidatorDefinition[]) => {
                const sut = new ValidationHandler(null);
                const rowData: BaseRowType<null>[] = [
                    {
                        data: {
                            ast: variableParser.parseAction(key.description),
                            values_replaced: {
                                value1: null
                            },
                            _metaDefinition: new RowDefinition({
                                key: null,
                                type: null,
                                selectorType: null,
                                executionUnit: null,
                                parameterType: null,
                                validators: [new QualifierValidator(validatorDef)]
                            })
                        }
                    }
                ];

                sut.validate(rowData);
            }
        );

        /**
         *
         */
        it.each([
            [1, Symbol('out'), [{ qualifier: 'store' }], "Qualifier '' of action 'out' is not defined. Allowed is 'store'"],
            [
                2,
                Symbol('out:store'),
                [{ qualifier: 'store', paras: ['para1'] }, { qualifier: '' }],
                "Qualifier 'store' of action 'out:store' is not defined. Allowed is 'store:para1' or ''"
            ],
            [
                3,
                Symbol('out:store:para1'),
                [{ qualifier: 'store', paras: ['para1:para2'] }],
                "Qualifier 'store:para1' of action 'out:store:para1' is not defined. Allowed is 'store:para1:para2'"
            ]
        ])(
            `%s: check qualifier validation with paras - with error - metaKey: '%s', key: '%s', allowed Paras: '%s', error message: '%s'`,
            (nr: number, key: symbol, validatorDef: ValidatorDefinition[], errorMessage: string) => {
                const sut = new ValidationHandler(null);
                const rowData: BaseRowType<null>[] = [
                    {
                        data: {
                            ast: variableParser.parseAction(key.description),
                            values_replaced: {
                                value1: null
                            },
                            _metaDefinition: new RowDefinition({
                                key: null,
                                type: null,
                                selectorType: null,
                                executionUnit: null,
                                parameterType: null,
                                validators: [new QualifierValidator(validatorDef)]
                            })
                        }
                    }
                ];

                expect(() => sut.validate(rowData)).toThrow(errorMessage);
            }
        );
    });

    /**
     *
     */
    describe('check value required validator', () => {
        /**
         *
         */
        it.each([
            ['value1', '---', '---', null], //
            ['value2', '---', '---', null], //
            ['value1', '---', null, null], //
            ['value2', null, '---', null], //
            ['value1', null, '---', `xxx: missing value for column 'value1'`],
            ['value2', '---', null, `xxx: missing value for column 'value2'`],
            ['value1', null, null, `xxx: missing value for column 'value1'`],
            ['value2', null, null, `xxx: missing value for column 'value2'`]
        ])(
            `check required value (column: '%s', value: '%s', error message: 's'`,
            (requiredColumn: string, value1: string, value2: string, errorMessage: string) => {
                const sut = new ValidationHandler(null);
                const rowData: BaseRowType<null>[] = [
                    {
                        data: {
                            ast: variableParser.parseAction('xxx'),
                            values_replaced: {
                                value1,
                                value2
                            },
                            _metaDefinition: new RowDefinition({
                                key: Symbol('xxx'),
                                type: null,
                                selectorType: null,
                                executionUnit: null,
                                parameterType: ParaType.False,
                                validators: [new ValueRequiredValidator(requiredColumn)]
                            })
                        }
                    }
                ];

                // eslint-disable-next-line jest/no-conditional-in-test
                if (!errorMessage) {
                    sut.validate(rowData);
                } else {
                    // eslint-disable-next-line jest/no-conditional-expect
                    expect(() => sut.validate(rowData)).toThrow(errorMessage);
                }
            }
        );
    });
});
