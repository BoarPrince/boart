import 'jest-extended';

import { DefaultContext, DefaultRowType, ExecutionEngine, ExecutionUnit, RowDefinition, TableHandler, TableRowType } from '@boart/core';

import { QualifierValidator } from '../../validators/QualifierValidator';

import { WaitExecutionUnit } from './ExecutionUnit.Wait';

/**
 *
 */
class ExecutionUnitMock implements ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>> {
    readonly key = Symbol('desc');
    /**
     *
     */
    readonly description = () => ({
        id: '4b708e03-8faa-47e3-b6cd-e23a937b7cd1',
        description: '',
        examples: null
    });

    /**
     *
     */
    execute = jest.fn();
}

/**
 *
 */
class ExecutionEngineMock extends ExecutionEngine<DefaultContext, DefaultRowType<DefaultContext>> {
    /**
     *
     */
    constructor(mainExecutionUnit: ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>>) {
        super(() => mainExecutionUnit, ExecutionEngineMock.initializer());
    }

    /**
     *
     */
    private static initializer(): () => DefaultContext {
        return (): DefaultContext => ({
            config: {},
            preExecution: {
                payload: null
            },
            execution: {
                data: null,
                transformed: null,
                header: null
            }
        });
    }
}

/*
 *
 */
describe('check wait:before execution units', () => {
    const mainExecutionUnit = new ExecutionUnitMock();
    const executionEnginge = new ExecutionEngineMock(mainExecutionUnit);
    const tableHandler = new TableHandler(DefaultRowType, () => executionEnginge);

    const sut = new WaitExecutionUnit();

    /**
     *
     */
    beforeAll(() => {
        tableHandler.addRowDefinition(
            new RowDefinition({
                type: TableRowType.PreProcessing,
                executionUnit: sut,
                validators: [
                    new QualifierValidator([
                        { qualifier: null, paras: null },
                        { qualifier: 'before', paras: ['', 'sec', 'min'] },
                        { qualifier: 'sec', paras: null },
                        { qualifier: 'min', paras: null }
                    ])
                ]
            })
        );
    });

    /**
     *
     */
    afterEach(() => {
        jest.useRealTimers();
    });

    /**
     *
     */
    it('must be a number', async () => {
        await expect(async () => {
            await tableHandler.process({
                headers: {
                    cells: ['action', 'value']
                },
                rows: [
                    {
                        cells: [`wait:before`, 'a']
                    }
                ]
            });
        }).rejects.toThrow("column 'value' must be a integer (number) value, but is 'a'");
    });

    /**
     *
     */
    it('must be called before (wait:before)', async () => {
        jest.useFakeTimers();

        const sutSpy = jest.spyOn(sut, 'execute');
        jest.spyOn(global, 'setTimeout') //
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .mockImplementation((callback: () => void, ms: number): any => {
                jest.advanceTimersByTime(ms);
                callback();
            });

        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`wait:before`, '10']
                }
            ]
        });

        expect(sutSpy).toHaveBeenCalledBefore(mainExecutionUnit.execute);
    });

    /**
     *
     */
    it('without para is like sec (wait:before)', async () => {
        jest.useFakeTimers();

        jest.spyOn(global, 'setTimeout') //
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .mockImplementation((callback: () => void, ms: number): any => {
                jest.advanceTimersByTime(ms);
                callback();
            });

        const ticksBefore = Date.now() / 1000;
        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`wait:before`, '10']
                }
            ]
        });

        const ticksAfter = Date.now() / 1000;
        expect(ticksAfter).toBe(ticksBefore + 10);
    });

    /**
     *
     */
    it('wait:before:sec, 10 must wait 10 seconds', async () => {
        jest.useFakeTimers();

        jest.spyOn(global, 'setTimeout') //
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .mockImplementation((callback: () => void, ms: number): any => {
                jest.advanceTimersByTime(ms);
                callback();
            });

        const ticksBefore = Date.now() / 1000;
        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`wait:before:sec`, '10']
                }
            ]
        });

        const ticksAfter = Date.now() / 1000;
        expect(ticksAfter).toBe(ticksBefore + 10);
    });

    /**
     *
     */
    it('wait:before:min, 1 must wait one minute', async () => {
        jest.useFakeTimers();

        jest.spyOn(global, 'setTimeout') //
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .mockImplementation((callback: () => void, ms: number): any => {
                jest.advanceTimersByTime(ms);
                callback();
            });

        const ticksBefore = Date.now() / 1000;
        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`wait:before:min`, '1']
                }
            ]
        });

        const ticksAfter = Date.now() / 1000;
        expect(ticksAfter).toBe(ticksBefore + 60);
    });
});

/*
 *
 */
describe('check wait:after execution units', () => {
    const mainExecutionUnit = new ExecutionUnitMock();
    const executionEnginge = new ExecutionEngineMock(mainExecutionUnit);
    const tableHandler = new TableHandler(DefaultRowType, () => executionEnginge);

    const sut = new WaitExecutionUnit();

    /**
     *
     */
    beforeAll(() => {
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('wait:after'),
                type: TableRowType.PostProcessing,
                executionUnit: sut,
                validators: [
                    new QualifierValidator([
                        { qualifier: null, paras: null },
                        { qualifier: 'after', paras: ['', 'sec', 'min'] },
                        { qualifier: 'sec', paras: null },
                        { qualifier: 'min', paras: null }
                    ])
                ]
            })
        );
    });

    /**
     *
     */
    afterEach(() => {
        jest.useRealTimers();
    });

    /**
     *
     */
    it('must be called after (wait:after)', async () => {
        jest.useFakeTimers();

        const sutSpy = jest.spyOn(sut, 'execute');
        jest.spyOn(global, 'setTimeout') //
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .mockImplementation((callback: () => void, ms: number): any => {
                jest.advanceTimersByTime(ms);
                callback();
            });

        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`wait:after`, '10']
                }
            ]
        });

        expect(mainExecutionUnit.execute).toHaveBeenCalledBefore(sutSpy as unknown as jest.Mock);
    });

    /**
     *
     */
    it('wait:after:sec, 10 must wait 10 seconds', async () => {
        jest.useFakeTimers();

        jest.spyOn(global, 'setTimeout') //
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .mockImplementation((callback: () => void, ms: number): any => {
                jest.advanceTimersByTime(ms);
                callback();
            });

        const ticksBefore = Date.now() / 1000;
        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`wait:after:sec`, '10']
                }
            ]
        });

        const ticksAfter = Date.now() / 1000;
        expect(ticksAfter).toBe(ticksBefore + 10);
    });

    /**
     *
     */
    it('wait:after:min, 1 must wait one minute', async () => {
        jest.useFakeTimers();

        jest.spyOn(global, 'setTimeout') //
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .mockImplementation((callback: () => void, ms: number): any => {
                jest.advanceTimersByTime(ms);
                callback();
            });

        const ticksBefore = Date.now() / 1000;
        await tableHandler.process({
            headers: {
                cells: ['action', 'value']
            },
            rows: [
                {
                    cells: [`wait:after:min`, '1']
                }
            ]
        });

        const ticksAfter = Date.now() / 1000;
        expect(ticksAfter).toBe(ticksBefore + 60);
    });
});
