import { NodeForkExecutionProxyUnit } from './NodeForkExecutionProxyUnit';
import { NodeForkServer } from './NodeForkServer';
import { DefaultContext, NullContent } from '@boart/core';
import { StepReport } from '@boart/protocol';

/**
 *
 */
jest.mock('./NodeForkServer');

/**
 *
 */
jest.mock<typeof import('@boart/protocol')>('@boart/protocol', () => {
    const originalModule = jest.requireActual('@boart/protocol');

    const _instance = {
        addInputItem: jest.fn(),
        addResultItem: jest.fn(),
        type: jest.fn()
    };

    return {
        __esModule: true,
        ...originalModule,
        StepReport: class {
            public static get instance() {
                return _instance;
            }
        }
    };
});

/**
 *
 */
let context: DefaultContext;
beforeEach(() => {
    context = {
        config: {},
        preExecution: {
            payload: null
        },
        execution: {
            data: null,
            header: null,
            transformed: null
        }
    };
});

/**
 *
 */
describe('proxy', () => {
    /**
     *
     */
    test('without reports', async () => {
        const server = new NodeForkServer('-path-');

        jest.spyOn(server, 'execute').mockResolvedValue({
            execution: {
                data: null,
                header: null
            },
            reportItems: []
        });

        const sut = new NodeForkExecutionProxyUnit('-name-', server);
        await sut.execute(context);

        expect(context.execution.data).toBeInstanceOf(NullContent);
        expect(context.execution.header).toBeInstanceOf(NullContent);

        expect(StepReport.instance.type).toBe('-name-');
        expect(StepReport.instance.addInputItem).not.toHaveBeenCalled();
        expect(StepReport.instance.addResultItem).not.toHaveBeenCalled();
    });

    /**
     *
     */
    test('with input reports', async () => {
        const server = new NodeForkServer('-path-');

        jest.spyOn(server, 'execute').mockResolvedValue({
            execution: {
                data: null,
                header: null
            },
            reportItems: [
                {
                    description: '-desc-',
                    dataType: 'json',
                    type: 'input',
                    data: '-data-'
                }
            ]
        });

        const sut = new NodeForkExecutionProxyUnit('-name-', server);
        await sut.execute(context);

        expect(StepReport.instance.addResultItem).not.toHaveBeenCalled();
        expect(StepReport.instance.addInputItem).toHaveBeenCalledTimes(1);
        expect(StepReport.instance.addInputItem).toHaveBeenCalledWith('-desc-', 'json', '-data-');
    });

    /**
     *
     */
    test('with output reports', async () => {
        const server = new NodeForkServer('-path-');

        jest.spyOn(server, 'execute').mockResolvedValue({
            execution: {
                data: null,
                header: null
            },
            reportItems: [
                {
                    description: '-desc-',
                    dataType: 'json',
                    type: 'header',
                    data: '-data-result-'
                }
            ]
        });

        const sut = new NodeForkExecutionProxyUnit('-name-', server);
        await sut.execute(context);

        expect(StepReport.instance.addInputItem).not.toHaveBeenCalled();
        expect(StepReport.instance.addResultItem).toHaveBeenCalledTimes(1);
        expect(StepReport.instance.addResultItem).toHaveBeenCalledWith('-desc-', 'json', '-data-result-');
    });

    /**
     *
     */
    test('with input and output reports', async () => {
        const server = new NodeForkServer('-path-');

        jest.spyOn(server, 'execute').mockResolvedValue({
            execution: {
                data: null,
                header: null
            },
            reportItems: [
                {
                    description: '-desc-',
                    dataType: 'json',
                    type: 'input',
                    data: '-data-input-'
                },
                {
                    description: '-desc-',
                    dataType: 'json',
                    type: 'header',
                    data: '-data-result-'
                }
            ]
        });

        const sut = new NodeForkExecutionProxyUnit('-name-', server);
        await sut.execute(context);

        expect(StepReport.instance.addInputItem).toHaveBeenCalledTimes(1);
        expect(StepReport.instance.addInputItem).toHaveBeenCalledWith('-desc-', 'json', '-data-input-');
        expect(StepReport.instance.addResultItem).toHaveBeenCalledTimes(1);
        expect(StepReport.instance.addResultItem).toHaveBeenCalledWith('-desc-', 'json', '-data-result-');
    });
});
