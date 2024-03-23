import { ExecutionEngine, RepeatableExecutionContext, Runtime, StepContext } from '..';

import { AnyBaseRowType } from './BaseRowType';
import { GroupRowDefinition } from './GroupRowDefinition';
import { RowDefinition } from './RowDefinition';
import { TableHandler } from './TableHandler';
import { TableMetaInfo } from './TableMetaInfo';
import { key, value } from './TableRowDecorator';
import { TableRowType } from './TableRowType';

/**
 *
 */
TableMetaInfo.get = () => {
    return {
        tableName: 'my-table',
        key: 'my-action',
        values: ['my-value'],
        requiredValues: ['my-value']
    };
};

/**
 *
 */
class RowWithOneValue extends AnyBaseRowType {
    @key()
    get action() {
        return this.data.ast.name.value;
    }

    get actionPara() {
        return this.data.ast.qualifier?.stringValue;
    }

    @value()
    get value() {
        return this.data.values_replaced['my-value'];
    }
}

/**
 *
 */
describe('default', () => {
    /**
     *
     */
    it('add row definitions (value)', () => {
        const sut = new TableHandler(null, null);

        sut.addRowDefinition(
            new RowDefinition({
                key: Symbol('my-value'),
                type: TableRowType.PostProcessing,
                executionUnit: null,
                validators: null
            })
        );
    });

    /**
     *
     */
    it('process rows', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const executionEngineMock: any = {
            execute: jest.fn(),
            preExecute: jest.fn().mockResolvedValue(true)
        };

        const sut = new TableHandler(RowWithOneValue, () => executionEngineMock);

        sut.addRowDefinition(
            new RowDefinition({
                key: Symbol('a'),
                type: TableRowType.PostProcessing,
                executionUnit: null,
                validators: null
            })
        );

        await sut.process({
            headers: {
                cells: ['my-action', 'my-value']
            },
            rows: [
                {
                    cells: ['a', 'b']
                }
            ]
        });

        const callPara = executionEngineMock.execute.mock.calls[0][0] as Array<RowWithOneValue>;
        expect(callPara).toBeInstanceOf(Array);
        expect(callPara).toHaveLength(1);

        expect(callPara[0].data.ast.name.value).toBe('a');
        expect(callPara[0].value).toBe('b');

        expect(executionEngineMock.preExecute) //
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            .toHaveBeenCalledBefore(executionEngineMock.execute);
    });

    /**
     *
     */
    it('processing rows stopped - becaue run:', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const executionEngineMock: any = {
            execute: jest.fn(),
            preExecute: jest.fn().mockResolvedValue(false)
        };

        const sut = new TableHandler(RowWithOneValue, () => executionEngineMock);

        sut.addRowDefinition(
            new RowDefinition({
                key: Symbol('a'),
                type: TableRowType.PostProcessing,
                executionUnit: null,
                validators: null
            })
        );

        await sut.process({
            headers: {
                cells: ['my-action', 'my-value']
            },
            rows: [
                {
                    cells: ['a', 'b']
                }
            ]
        });

        expect(executionEngineMock.preExecute).toHaveBeenCalledOnce();
        expect(executionEngineMock.execute).not.toHaveBeenCalled();
    });

    /**
     *
     */
    it('add groupRow validation must add validators', () => {
        const groupRowDefinition = GroupRowDefinition.getInstance('xxx');
        groupRowDefinition.addGroupValidation({
            name: 'validator1',
            validate: null
        });
        groupRowDefinition.addGroupValidation({
            name: 'validator2',
            validate: null
        });

        const sut = new TableHandler(RowWithOneValue, null);
        jest.spyOn(sut, 'addGroupValidator').mockImplementation();
        sut.addGroupRowDefinition(groupRowDefinition);

        expect(sut.addGroupValidator).toHaveBeenCalledTimes(2);
    });

    /**
     *
     */
    it('add groupRow definition must add definitions', () => {
        const groupRowDefinition = GroupRowDefinition.getInstance('xxx');
        groupRowDefinition.addRowDefinition(
            new RowDefinition({
                key: Symbol('key'),
                type: TableRowType.Configuration,
                executionUnit: null,
                validators: null
            })
        );

        const sut = new TableHandler(RowWithOneValue, null);
        jest.spyOn(sut, 'addRowDefinition').mockImplementation();
        sut.addGroupRowDefinition(groupRowDefinition);

        expect(sut.addRowDefinition).toHaveBeenCalledTimes(1);
    });
});

/**
 *
 */
describe('with repetition', () => {
    const errorMessage = 'an error occured';

    type initial = {
        sut: TableHandler<null, RowWithOneValue>;
        executionEngineMock: ExecutionEngine<RepeatableExecutionContext<null, null, null>, null>;
    };

    /**
     *
     */
    const init = (count: number, pause: number, noErrorFrom = 100): initial => {
        Runtime.instance.stepRuntime.currentContext = new StepContext();

        let callCount = 0;
        const executionEngineMock = {
            execute: jest.fn().mockImplementation(() => {
                if (callCount++ < noErrorFrom) {
                    throw new Error(errorMessage);
                }
            }),
            preExecute: jest.fn().mockResolvedValue(true),
            context: <RepeatableExecutionContext<null, null, null>>{
                repetition: {
                    count,
                    pause
                }
            }
        } as never;

        const sut: TableHandler<null, RowWithOneValue> = new TableHandler(RowWithOneValue, () => executionEngineMock);

        sut.addRowDefinition(
            new RowDefinition({
                type: TableRowType.PreProcessing,
                executionUnit: {
                    key: Symbol('action1'),
                    execute: null
                },
                validators: null
            })
        );

        return {
            executionEngineMock,
            sut
        };
    };

    /**
     *
     */
    it('zero repetations with error', async () => {
        const initial = init(0, 0);

        await expect(() =>
            initial.sut.process({
                headers: {
                    cells: ['my-action', 'my-value']
                },
                rows: [
                    {
                        cells: ['action1', '0']
                    }
                ]
            })
        ).rejects.toThrow(errorMessage);

        expect(initial.executionEngineMock.preExecute).toHaveBeenCalledOnce();
        expect(initial.executionEngineMock.execute).toHaveBeenCalledOnce();
    });

    /**
     *
     */
    it('one repitation with error', async () => {
        const initial = init(1, 10);

        await expect(() =>
            initial.sut.process({
                headers: {
                    cells: ['my-action', 'my-value']
                },
                rows: [
                    {
                        cells: ['action1', '0']
                    }
                ]
            })
        ).rejects.toThrow(errorMessage);

        expect(initial.executionEngineMock.preExecute).toHaveBeenCalledTimes(2);
        expect(initial.executionEngineMock.execute).toHaveBeenCalledTimes(2);
    });

    /**
     *
     */
    it('two repitations with error', async () => {
        const initial = init(2, 10);

        await expect(() =>
            initial.sut.process({
                headers: {
                    cells: ['my-action', 'my-value']
                },
                rows: [
                    {
                        cells: ['action1', '0']
                    }
                ]
            })
        ).rejects.toThrow(errorMessage);

        expect(initial.executionEngineMock.preExecute).toHaveBeenCalledTimes(3);
        expect(initial.executionEngineMock.execute).toHaveBeenCalledTimes(3);
    });

    /**
     *
     */
    it('five repitations with error', async () => {
        const initial = init(5, 10);

        await expect(() =>
            initial.sut.process({
                headers: {
                    cells: ['my-action', 'my-value']
                },
                rows: [
                    {
                        cells: ['action1', '0']
                    }
                ]
            })
        ).rejects.toThrow(errorMessage);

        expect(initial.executionEngineMock.preExecute).toHaveBeenCalledTimes(6);
        expect(initial.executionEngineMock.execute).toHaveBeenCalledTimes(6);
    });

    /**
     *
     */
    it('zero repitations with no error', async () => {
        const initial = init(0, 10, 0);

        await initial.sut.process({
            headers: {
                cells: ['my-action', 'my-value']
            },
            rows: [
                {
                    cells: ['action1', '0']
                }
            ]
        });

        expect(initial.executionEngineMock.preExecute).toHaveBeenCalledTimes(1);
        expect(initial.executionEngineMock.execute).toHaveBeenCalledTimes(1);
    });

    /**
     *
     */
    it('one repitations with no error at the first reputation', async () => {
        const initial = init(1, 10, 1);

        await initial.sut.process({
            headers: {
                cells: ['my-action', 'my-value']
            },
            rows: [
                {
                    cells: ['action1', '0']
                }
            ]
        });

        expect(initial.executionEngineMock.preExecute).toHaveBeenCalledTimes(2);
        expect(initial.executionEngineMock.execute).toHaveBeenCalledTimes(2);
    });

    /**
     *
     */
    it('two repitations with no error at the two reputation', async () => {
        const initial = init(2, 10, 2);

        await initial.sut.process({
            headers: {
                cells: ['my-action', 'my-value']
            },
            rows: [
                {
                    cells: ['action1', '0']
                }
            ]
        });

        expect(initial.executionEngineMock.preExecute).toHaveBeenCalledTimes(3);
        expect(initial.executionEngineMock.execute).toHaveBeenCalledTimes(3);
    });

    /**
     *
     */
    it('five repitations with no error at the fifths reputation', async () => {
        const initial = init(5, 10, 5);

        await initial.sut.process({
            headers: {
                cells: ['my-action', 'my-value']
            },
            rows: [
                {
                    cells: ['action1', '0']
                }
            ]
        });

        expect(initial.executionEngineMock.preExecute).toHaveBeenCalledTimes(6);
        expect(initial.executionEngineMock.execute).toHaveBeenCalledTimes(6);
    });

    /**
     *
     */
    it('five repitations with no error at the second reputation', async () => {
        const initial = init(5, 10, 2);

        await initial.sut.process({
            headers: {
                cells: ['my-action', 'my-value']
            },
            rows: [
                {
                    cells: ['action1', '0']
                }
            ]
        });

        expect(initial.executionEngineMock.preExecute).toHaveBeenCalledTimes(3);
        expect(initial.executionEngineMock.execute).toHaveBeenCalledTimes(3);
    });
});
