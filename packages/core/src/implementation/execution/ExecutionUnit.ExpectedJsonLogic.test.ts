import { ExecutionEngine } from '../../common/execution/ExecutionEngine';
import { ExecutionUnit } from '../../common/execution/ExecutionUnit';
import { RowDefinition } from '../../common/table/RowDefinition';
import { TableHandler } from '../../common/table/TableHandler';
import { TableRowType } from '../../common/table/TableRowType';
import { NullContent } from '../../data/NullContent';
import { RowTypeValue } from '../RowTypeValue';
import { ExpectedJsonLogicExecutionUnit } from './ExecutionUnit.ExpectedJsonLogic';
import { NativeContent } from '../../data/NativeContent';
import { DataContext } from '../DataExecutionContext';

/**
 *
 */
class ExecutionUnitMock implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    /**
     *
     */
    description = 'desc';

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute = jest.fn(
        (context: DataContext, row: RowTypeValue<DataContext>): Promise<void> => {
            // do noting
            return;
        }
    );
}

/**
 *
 */
class ExecutionEngineMock extends ExecutionEngine<DataContext, RowTypeValue<DataContext>> {
    /**
     *
     */
    constructor() {
        super(new ExecutionUnitMock(), ExecutionEngineMock.initializer());
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
                value: ''
            },
            execution: {
                data: new NullContent(),
                header: null
            }
        });
    }
}

/*
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * E X P E C T E D : H E A D E R
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('check expected:jsonLogic execution units', () => {
    const tableHandler = new TableHandler(RowTypeValue, new ExecutionEngineMock());

    const sut = new ExpectedJsonLogicExecutionUnit();

    tableHandler.addRowDefinition(
        new RowDefinition({
            type: TableRowType.PostProcessing,
            executionUnit: sut,
            validators: null
        })
    );

    /**
     *
     */
    it('check truthy (correct)', () => {
        tableHandler.executionEngine.context.execution.data = new NativeContent(1);
        tableHandler.process({
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
    it('check falsy (correct)', () => {
        tableHandler.executionEngine.context.execution.data = new NativeContent(1);
        tableHandler.process({
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
    it('check falsy (correct)', () => {
        tableHandler.executionEngine.context.execution.data = new NativeContent(1);
        tableHandler.process({
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
    it('check wrong property', () => {
        tableHandler.executionEngine.context.execution.data = new NativeContent(1);
        try {
            tableHandler.process({
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
            expect(error.message).toBe("Parameter 'fals' is not defined");
            return;
        }

        throw Error(`error must occur when property is not 'true' or 'false'`);
    });
});
