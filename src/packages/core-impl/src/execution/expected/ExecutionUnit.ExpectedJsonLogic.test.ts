import { ExecutionEngine, ExecutionUnit, NativeContent, NullContent, RowDefinition, TableHandler, TableRowType } from '@boart/core';

import { DataContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';

import { ExpectedJsonLogicExecutionUnit } from './ExecutionUnit.ExpectedJsonLogic';

/**
 *
 */
class ExecutionUnitMock implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    /**
     *
     */
    description = 'mock';

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
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
class ExecutionEngineMock extends ExecutionEngine<DataContext, RowTypeValue<DataContext>> {
    /**
     *
     */
    constructor() {
        super(() => new ExecutionUnitMock(), ExecutionEngineMock.initializer());
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
beforeEach(() => {
    intialContext.data = null;
    intialContext.header = null;
    intialContext.transformed = null;
});

/*
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * E X P E C T E D : H E A D E R
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('check expected:jsonLogic execution units', () => {
    const tableHandler = new TableHandler(RowTypeValue, () => new ExecutionEngineMock());

    const sut = new ExpectedJsonLogicExecutionUnit();

    tableHandler.addRowDefinition(
        new RowDefinition({
            type: TableRowType.PostProcessing,
            executionUnit: sut,
            validators: []
        })
    );

    /**
     *
     */
    it('check truthy (correct)', async () => {
        intialContext.data = new NativeContent(1);
        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`expected:jsonLogic:true`, '{"===": [{"var": ""}, 1]}']
                }
            ]
        });
    });

    /**
     *
     */
    it('check falsy (correct)', async () => {
        intialContext.data = new NativeContent(1);
        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`expected:jsonLogic:false`, '{"===": [{"var": ""}, 2]}']
                }
            ]
        });
    });

    /**
     *
     */
    it('check wrong property', async () => {
        intialContext.data = new NativeContent(1);
        try {
            await tableHandler.process({
                headers: {
                    cells: ['action', 'value']
                },
                rows: [
                    {
                        cells: [`expected:jsonLogic:fals`, '{"===": [{"var": ""}, 2]}']
                    }
                ]
            });
        } catch (error) {
            expect(error.message).toBe("Parameter 'fals' of key 'expected:jsonLogic' is not defined. Allowed is 'true'\n or 'false'");
            return;
        }

        throw Error(`error must occur when property is not 'true' or 'false'`);
    });
});
