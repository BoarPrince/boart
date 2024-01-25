import 'jest-extended';
import {
    DataContent,
    ExecutionEngine,
    ExecutionUnit,
    ExpectedOperator,
    ExpectedOperatorInitializer,
    NativeContent,
    NullContent,
    ObjectContent,
    RowDefinition,
    RowValidator,
    TableHandler,
    TableRowType,
    TextContent
} from '@boart/core';

import { DataContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';

import { ExpectedDataExecutinoUnit } from './ExecutionUnit.ExpectedData';
import { ExpectedOperatorImplementation } from './ExpectedOperator.Implementation';

/**
 *
 */
class ExecutionUnitMock implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    readonly key = Symbol('desc');

    /**
     *
     */
    readonly description = () => ({
        id: 'b3edad18-8281-4cda-9977-84f27036bbf7',
        description: '',
        examples: null
    });

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
    execute = jest.fn(async (context: DataContext, row: RowTypeValue<DataContext>): Promise<void> => {
        // do noting
        return;
    });
}

/**
 *
 */
const intialContext = {
    data: null,
    header: null,
    transformed: null
};

/**
 *
 */
class RestCallExecutionEngine extends ExecutionEngine<DataContext, RowTypeValue<DataContext>> {
    /**
     *
     */
    constructor() {
        super(() => new ExecutionUnitMock(), RestCallExecutionEngine.initializer());
    }

    /**
     *
     */
    private static initializer(): () => DataContext {
        return (): DataContext => ({
            config: {
                value: ''
            },
            preExecution: {
                payload: null
            },
            execution: {
                data: intialContext.data,
                transformed: intialContext.transformed,
                header: intialContext.header
            }
        });
    }
}

/**
 *
 */
beforeAll(() => {
    ExpectedOperatorImplementation.addAll();
});

/**
 *
 */
beforeEach(() => {
    intialContext.data = null;
    intialContext.header = null;
    intialContext.transformed = null;
});

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * E X P E C T E D : D A T A
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('check expected:data execution units', () => {
    const tableHandler = new TableHandler(RowTypeValue, () => new RestCallExecutionEngine());

    const sut1 = new ExpectedDataExecutinoUnit();

    /**
     *
     */
    beforeAll(() => {
        tableHandler.addRowDefinition(
            new RowDefinition({
                type: TableRowType.PostProcessing,
                executionUnit: sut1,
                validators: null
            })
        );
    });

    /**
     *
     */
    it('not must negate the result', async () => {
        intialContext.data = new TextContent('x');
        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: ['expected:not::data', 'y']
                }
            ]
        });
    });

    /**
     *
     */
    it('use default operator - data', async () => {
        intialContext.data = new TextContent('x');
        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: ['expected::data', 'x']
                }
            ]
        });
    });

    /**
     *
     */
    it('use default operator - without data', async () => {
        intialContext.data = new TextContent('x');
        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: ['expected', 'x']
                }
            ]
        });
    });

    /**
     *
     */
    describe('check correct', () => {
        /**
         *
         */
        it.each([
            ['1. string false', new TextContent('false'), 'false'],
            ['2. string true', new TextContent('true'), 'true'],
            ['3. boolean false', new NativeContent(false), 'false'],
            ['4. boolean true', new NativeContent(true), 'true'],
            ['5. string 0', new TextContent('0'), '0'],
            ['6. string 1', new TextContent('1'), '1'],
            ['7. number 0', new NativeContent(0), '0'],
            ['8. number 1', new NativeContent(1), '1'],
            ['9. object', new ObjectContent({ a: 1, b: 2, c: [3, 4, 5] }), '{"a":1,"b":2,"c":[3,4,5]}'],
            ['10. array', new ObjectContent([1, 2, 3, 4, 5]), '[1,2,3,4,5]']
        ])(`%s, data: %s -> expected: %s`, async (_: string, data: DataContent, expected: string) => {
            intialContext.data = data;
            await tableHandler.process({
                headers: {
                    cells: ['action', 'value']
                },
                rows: [
                    {
                        cells: ['expected::data', expected]
                    }
                ]
            });
        });
    });

    /**
     *
     */
    describe('check with property', () => {
        /**
         *
         */
        it.each([
            ['1. string with deep 1', 'a', new ObjectContent({ a: 'b' }), 'b'],
            ['2. string with deep 2', 'a.b', new ObjectContent({ a: { b: 'c' } }), 'c'],
            ['3. number', 'a.b', new ObjectContent({ a: { b: 10 } }), '10'],
            ['4. boolean (false)', 'a.b', new ObjectContent({ a: { b: false } }), 'false'],
            ['5. boolean (true)', 'a.b', new ObjectContent({ a: { b: true } }), 'true']
        ])(`%s, property: %s, data: %s -> expected: %s`, async (_: string, property: string, data: DataContent, expected: string) => {
            intialContext.data = data;
            await tableHandler.process({
                headers: {
                    cells: ['action', 'value']
                },
                rows: [
                    {
                        cells: [`expected::data#${property}`, expected]
                    }
                ]
            });
        });
    });

    /**
     *
     */
    describe('check failing', () => {
        /**
         *
         */
        it.each([
            ['string false', new TextContent('false'), '"false"'],
            ['number 0', new TextContent('0'), '1']
        ])(`%s, data: %s -> not expected: %s`, async (_: string, data: DataContent, expected: string) => {
            intialContext.data = data;
            await expect(() =>
                tableHandler.process({
                    headers: {
                        cells: ['action', 'value']
                    },
                    rows: [
                        {
                            cells: ['expected::data', expected]
                        }
                    ]
                })
            ).rejects.toThrow(`error: expected::data`);
        });
    });
});

/*
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * E X P E C T E D : H E A D E R
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('check expected:header execution units', () => {
    const tableHandler = new TableHandler(RowTypeValue, () => new RestCallExecutionEngine());

    const sut = new ExpectedDataExecutinoUnit<DataContext>();

    /**
     *
     */
    beforeAll(() => {
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('expected'),
                type: TableRowType.PostProcessing,
                executionUnit: sut,
                validators: null
            })
        );
    });

    /**
     *
     */
    describe('check with property', () => {
        /**
         *
         */
        it.each([
            ['1, string with deep 1', 'a', new ObjectContent({ a: 'b' }), 'b'],
            ['2, string with deep 2', 'a.b', new ObjectContent({ a: { b: 'c' } }), 'c'],
            ['3, number', 'a.b', new ObjectContent({ a: { b: 10 } }), '10'],
            ['4, boolean (false)', 'a.b', new ObjectContent({ a: { b: false } }), 'false'],
            ['5, boolean (true)', 'a.b', new ObjectContent({ a: { b: true } }), 'true']
        ])(`%s, property: %s, data: %s -> expected: %s`, async (_: string, property: string, header: DataContent, expected: string) => {
            intialContext.header = header;
            await tableHandler.process({
                headers: {
                    cells: ['action', 'value']
                },
                rows: [
                    {
                        cells: [`expected::header#${property}`, expected]
                    }
                ]
            });
        });
    });

    /**
     *
     */
    describe('check failing', () => {
        /**
         *
         */
        it.each([
            ['1. string false', 'a', new ObjectContent({ a: 'false' }), '"false"'],
            ['2. number 0', 'a', new ObjectContent({ a: '0' }), '1']
        ])(`%s, data: %s -> not expected: %s`, async (_: string, property: string, header: DataContent, expected: string) => {
            intialContext.header = header;
            await expect(() =>
                tableHandler.process({
                    headers: {
                        cells: ['action', 'value']
                    },
                    rows: [
                        {
                            cells: [`expected::header#${property}`, expected]
                        }
                    ]
                })
            ).rejects.toThrow('error: expected::header');
        });

        /**
         *
         */
        it('no parameter defined for accessing header', async () => {
            intialContext.header = new ObjectContent({ a: 'b' });
            await expect(() =>
                tableHandler.process({
                    headers: {
                        cells: ['action', 'value']
                    },
                    rows: [
                        {
                            cells: ['expected::header', 'b']
                        }
                    ]
                })
            ).rejects.toThrow('error: expected::header\n\texpected: b\n\tactual: {"a":"b"}');
        });
    });
});

/*
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * E X P E C T E D : T R A N S F O R M E D
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('check expected:transformed execution units', () => {
    const tableHandler = new TableHandler(RowTypeValue, () => new RestCallExecutionEngine());

    const sut = new ExpectedDataExecutinoUnit<DataContext>();

    /**
     *
     */
    beforeAll(() => {
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('expected'),
                type: TableRowType.PostProcessing,
                executionUnit: sut,
                validators: null
            })
        );
    });

    /**
     *
     */
    it('check transformed', async () => {
        intialContext.transformed = new TextContent('xxx');

        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`expected::transformed`, 'xxx']
                }
            ]
        });
    });
});

/*
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * E X P E C T E D   W I T H   O P E R A T O R
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('check expected:data execution units with operators', () => {
    let tableHandler: TableHandler<DataContext, RowTypeValue<DataContext>>;

    /**
     *
     */
    beforeEach(() => {
        ExpectedOperatorInitializer.instance.clear();
        tableHandler = new TableHandler(RowTypeValue, () => new RestCallExecutionEngine());
    });

    /**
     *
     */
    class TestOperator implements ExpectedOperator {
        check = jest.fn().mockReturnValue({
            result: true
        });

        /**
         *
         */
        constructor(public name: string) {}
        validators?: RowValidator[];
        caseInsesitive: true;
    }

    /**
     *
     */
    it('add operator before', async () => {
        ExpectedOperatorInitializer.instance.addOperator(new TestOperator('op1'));
        const sut = new ExpectedDataExecutinoUnit<DataContext>();

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('expected'),
                type: TableRowType.PostProcessing,
                executionUnit: sut,
                validators: null
            })
        );

        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: ['expected:op1::data', '']
                }
            ]
        });
    });

    /**
     *
     */
    it('add operator after', async () => {
        const sut = new ExpectedDataExecutinoUnit();

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('expected'),
                type: TableRowType.PostProcessing,
                executionUnit: sut,
                validators: null
            })
        );
        ExpectedOperatorInitializer.instance.addOperator(new TestOperator('op2'));

        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: ['expected:op2::data', '']
                }
            ]
        });
    });

    /**
     *
     */
    it('add operator and use negate', async () => {
        const sut = new ExpectedDataExecutinoUnit();

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('expected'),
                type: TableRowType.PostProcessing,
                executionUnit: sut,
                validators: null
            })
        );
        const operator = new TestOperator('op3');
        jest.spyOn(operator, 'check').mockReturnValue(false);
        ExpectedOperatorInitializer.instance.addOperator(operator);

        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: ['expected:op3:not::data', '']
                }
            ]
        });
    });

    /**
     *
     */
    it('use operator without data, header, or specification', async () => {
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('expected'),
                type: TableRowType.PostProcessing,
                executionUnit: new ExpectedDataExecutinoUnit(),
                validators: null
            })
        );
        const operator = new TestOperator('op3');
        operator.check = jest.fn().mockReturnValue(false);
        ExpectedOperatorInitializer.instance.addOperator(operator);

        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: ['expected:op3', '']
                }
            ]
        });
    });

    /**
     *
     */
    it('NativeContent value parameter', async () => {
        ExpectedOperatorInitializer.instance.clear();

        const operator = new TestOperator('op1');
        ExpectedOperatorInitializer.instance.addOperator(operator);
        const sut = new ExpectedDataExecutinoUnit();

        const dataToCheck = new NativeContent(1);
        intialContext.data = dataToCheck;
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('expected'),
                type: TableRowType.PostProcessing,
                executionUnit: sut,
                validators: null
            })
        );

        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: ['expected:op1::data', 'b']
                }
            ]
        });

        expect(operator.check).toBeCalledTimes(1);
        expect(operator.check.mock.calls[0][0]).toBeInteger();
        expect(operator.check.mock.calls[0][1]).toBeString();
        expect(operator.check).toBeCalledWith(dataToCheck.valueOf(), 'b');
    });

    /**
     *
     */
    it('check ObjectContent value parameter', async () => {
        const operator = new TestOperator('op1');
        ExpectedOperatorInitializer.instance.addOperator(operator);
        const sut = new ExpectedDataExecutinoUnit<DataContext>();

        const dataToCheck = new ObjectContent({ a: 'b' });
        intialContext.data = dataToCheck;
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('expected'),
                type: TableRowType.PostProcessing,
                executionUnit: sut,
                validators: null
            })
        );

        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: ['expected:op1::data', 'b']
                }
            ]
        });

        expect(operator.check).toBeCalledTimes(1);
        expect(operator.check.mock.calls[0][0]).toBeObject();
        expect(operator.check.mock.calls[0][1]).toBeString();
        expect(operator.check).toBeCalledWith(dataToCheck.valueOf(), 'b');
    });

    /**
     *
     */
    it('add operator with the same name twice (do not ignore)', () => {
        const operator1 = new TestOperator('op1');
        const operator2 = new TestOperator('op1');

        ExpectedOperatorInitializer.instance.addOperator(operator1);
        expect(() => ExpectedOperatorInitializer.instance.addOperator(operator2)).toThrowError("expected operator 'op1' already exists");
    });

    /**
     *
     */
    it('add operator with the same name twice (ignore equal)', () => {
        const operator1 = new TestOperator('op1');
        const operator2 = new TestOperator('op1');

        ExpectedOperatorInitializer.instance.addOperator(operator1);
        ExpectedOperatorInitializer.instance.addOperator(operator2, true);
    });

    /**
     *
     */
    it('operator with error message', async () => {
        const operator = new TestOperator('op1');
        jest.spyOn(operator, 'check').mockReturnValue({
            result: false,
            errorMessage: 'operator error message'
        });

        ExpectedOperatorInitializer.instance.addOperator(operator);
        const sut = new ExpectedDataExecutinoUnit<DataContext>();

        intialContext.data = new NullContent();
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('expected'),
                type: TableRowType.PostProcessing,
                executionUnit: sut,
                validators: null
            })
        );

        await expect(async () => {
            await tableHandler.process({
                headers: {
                    cells: ['action', 'value']
                },
                rows: [
                    {
                        cells: ['expected:op1::data', '']
                    }
                ]
            });
        }).rejects.toThrow('operator error message');
    });

    /**
     *
     */
    it('operator with validator', async () => {
        /**
         *
         */
        const validator: RowValidator = {
            validate: jest.fn().mockImplementation(() => {
                throw Error('validator error');
            })
        };

        /**
         *
         */
        const operator: ExpectedOperator = {
            name: 'opv',
            validators: [validator],
            check: jest.fn(),
            caseInsesitive: false
        };

        ExpectedOperatorInitializer.instance.addOperator(operator);
        const sut = new ExpectedDataExecutinoUnit<DataContext>();

        intialContext.data = new NullContent();
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('expected'),
                type: TableRowType.PostProcessing,
                executionUnit: sut,
                validators: null
            })
        );

        await expect(async () => {
            await tableHandler.process({
                headers: {
                    cells: ['action', 'value']
                },
                rows: [
                    {
                        cells: ['expected:opv::data', '']
                    }
                ]
            });
        }).rejects.toThrow('validator error');
    });
});

/*
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * E X P E C T E D   U S I N G   C I
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('check expected:data ci operator', () => {
    let tableHandler: TableHandler<DataContext, RowTypeValue<DataContext>>;

    /**
     *
     */
    beforeEach(() => {
        ExpectedOperatorInitializer.instance.clear();
        tableHandler = new TableHandler(RowTypeValue, () => new RestCallExecutionEngine());
    });

    /**
     *
     */
    class TestOperator implements ExpectedOperator {
        check = jest.fn().mockReturnValue({
            result: true
        });

        /**
         *
         */
        constructor(
            public name: string,
            def = false
        ) {
            this.default = def;
        }
        default = false;
        validators?: RowValidator[];
        caseInsesitive = true;
    }

    class TestDefaultOperator implements ExpectedOperator {
        check = jest.fn().mockImplementation((value, expectedValue) => ({
            result: value == expectedValue
        }));

        /**
         *
         */
        constructor(public name: string) {}
        default = true;
        validators?: RowValidator[];
        caseInsesitive = true;
    }

    /**
     *
     */
    it('with ci the string values are transformed to lowercase values', async () => {
        const operator = new TestOperator('op1');
        ExpectedOperatorInitializer.instance.addOperator(operator);
        const sut = new ExpectedDataExecutinoUnit<DataContext>();

        const dataToCheck = new TextContent('UPPER-CASE');
        intialContext.data = dataToCheck;
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('expected'),
                type: TableRowType.PostProcessing,
                executionUnit: sut,
                validators: null
            })
        );

        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: ['expected:op1:ci::data', 'UPPER-CASe']
                }
            ]
        });

        expect(operator.check).toHaveBeenCalledTimes(1);
        expect(operator.check.mock.calls[0][0]).toBeString();
        expect(operator.check.mock.calls[0][1]).toBeString();
        expect(operator.check).toHaveBeenCalledWith(dataToCheck.toString().toLowerCase(), 'upper-case');
    });

    /**
     *
     */
    it('default operator has ci too', async () => {
        const operator = new TestDefaultOperator('op1');
        ExpectedOperatorInitializer.instance.addOperator(operator);

        const sut = new ExpectedDataExecutinoUnit<DataContext>();

        const dataToCheck = new TextContent('upper-case');
        intialContext.data = dataToCheck;
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('expected'),
                type: TableRowType.PostProcessing,
                executionUnit: sut,
                validators: null
            })
        );

        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: ['expected:ci::data', 'UPPER-CASE']
                }
            ]
        });
    });

    /**
     *
     */
    it('default operator has ci:not too - fails', async () => {
        const operator = new TestDefaultOperator('op1');
        ExpectedOperatorInitializer.instance.addOperator(operator);

        const sut = new ExpectedDataExecutinoUnit<DataContext>();

        const dataToCheck = new TextContent('upper-case');
        intialContext.data = dataToCheck;
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('expected'),
                type: TableRowType.PostProcessing,
                executionUnit: sut,
                validators: null
            })
        );

        await expect(() =>
            tableHandler.process({
                headers: {
                    cells: ['action', 'value']
                },
                rows: [
                    {
                        cells: ['expected:ci:not::data', 'UPPER-CASE']
                    }
                ]
            })
        ).rejects.toThrow('error: expected:ci:not::data\n\tci:not: UPPER-CASE\n\tactual: upper-case');
    });

    /**
     *
     */
    it('default operator has ci:not too - succeed', async () => {
        const operator = new TestDefaultOperator('op1');
        ExpectedOperatorInitializer.instance.addOperator(operator);

        const sut = new ExpectedDataExecutinoUnit<DataContext>();

        const dataToCheck = new TextContent('upper-cas');
        intialContext.data = dataToCheck;
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('expected'),
                type: TableRowType.PostProcessing,
                executionUnit: sut,
                validators: null
            })
        );

        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: ['expected:ci:not::data', 'UPPER-CASE']
                }
            ]
        });
    });
});
