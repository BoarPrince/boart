/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyBaseRowType } from '../table/BaseRowType';
import { ParaType } from '../types/ParaType';
import { SelectorType } from '../types/SelectorType';
import { GroupValidator } from './GroupValidator';
import { RowValidator } from './RowValidator';
import { ValidationHandler } from './ValidationHandler';

describe('check row validators', () => {
    /**
     *
     */
    describe('check basic ValidationHandler functionality', () => {
        /**
         *
         */
        it('check if row validator list is null, no error shall occur', () => {
            const sut = new ValidationHandler(null);
            const rowData: AnyBaseRowType = {
                data: {
                    key: 'a:a',
                    keyPara: null,
                    selector: null,
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
                        selectorType: SelectorType.Optional,
                        validators: null
                    }
                }
            };

            sut.validate([rowData]);
        });

        /**
         *
         */
        it('check with row validator', () => {
            /**
             * Mock Validator
             */
            const validator = {
                validate: jest.fn()
            } as RowValidator;

            const sut = new ValidationHandler(null);
            const rowData: AnyBaseRowType = {
                data: {
                    key: 'a:a',
                    keyPara: null,
                    selector: null,
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
                        selectorType: SelectorType.Optional,
                        validators: [validator]
                    }
                }
            };

            sut.validate([rowData]);

            expect(validator.validate).toBeCalledTimes(1);
            expect(validator.validate).toBeCalledWith(
                rowData.data,
                [rowData].map((row) => row.data)
            );
        });

        /**
         *
         */
        it('check with group validator', () => {
            /**
             * Mock Validator
             */
            const validator = {
                name: 'test',
                validate: jest.fn()
            } as GroupValidator;

            const sut = new ValidationHandler([validator]);
            const rowData: AnyBaseRowType = {
                data: {
                    key: 'a:a',
                    keyPara: null,
                    selector: null,
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
                        selectorType: SelectorType.Optional,
                        validators: null
                    }
                }
            };

            sut.validate([rowData]);

            expect(validator.validate).toBeCalledTimes(1);
            expect(validator.validate).toBeCalledWith([rowData].map((row) => row.data));
        });
    });
});
