import { PluginResponse } from '@boart/core';
import { NodeForkClient } from './NodeForkClient';
import { NodeForkRequest } from './NodeForkRequest';

/**
 *
 */
type OnListeners = Map<string, Array<(value: NodeForkRequest) => void>>;

/**
 *
 */
const mockChildProcess = (listeners: OnListeners): NodeJS.Process => {
    const proc = {} as NodeJS.Process;

    listeners.set('message', []);
    listeners.set('uncaughtException', []);

    proc.on = () => proc;
    jest.spyOn(proc, 'on').mockImplementation((name: string, listener: (message: unknown) => void) => {
        listeners.get(name).push(listener);
        return proc;
    });

    proc.send = () => true;
    jest.spyOn(proc, 'send');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    proc.emit = (): any => true;
    jest.spyOn(proc, 'emit');

    return proc;
};

/**
 *
 */
let response: PluginResponse;
let onListeners: OnListeners;
let listenerData: NodeForkRequest;

/**
 *
 */
beforeEach(() => {
    jest.useFakeTimers();
    onListeners = new Map<string, Array<(value: unknown) => void>>();
    process = mockChildProcess(onListeners);

    response = JSON.parse(
        JSON.stringify({
            execution: {
                data: {},
                header: {}
            },
            reportItems: []
        })
    );

    listenerData = JSON.parse(
        JSON.stringify({
            id: '-id-',
            data: {
                context: {
                    config: undefined,
                    preExecution: undefined,
                    execution: {
                        data: '-message-',
                        header: '',
                        transformed: ''
                    }
                },
                action: {
                    name: '',
                    ast: undefined
                }
            }
        } as NodeForkRequest)
    );
});

/**
 *
 */
describe('synchron', () => {
    /**
     *
     */
    test('message is called without any error', async () => {
        const remoteClient = {
            action: '-test-action-',
            execute: jest.fn().mockReturnValue(response)
        };

        const sut = new NodeForkClient();
        sut.pluginHandler.setMainExecutionUnit(() => remoteClient);
        sut.start();

        onListeners.get('message').forEach((listener) => listener(listenerData));
        await jest.runAllTimersAsync();

        expect(process.send).toHaveBeenCalledTimes(1);
        expect(process.send).toHaveBeenCalledWith({ id: '-id-', error: undefined, data: response });
    });

    /**
     *
     */
    test('message is called with a simple error', async () => {
        const remoteClient = {
            action: '-test-action-',
            execute: jest.fn().mockImplementation(() => {
                throw '-error-';
            })
        };

        const sut = new NodeForkClient();
        sut.pluginHandler.setMainExecutionUnit(() => remoteClient);
        sut.start();

        onListeners.get('message').forEach((listener) => listener(listenerData));
        await jest.runAllTimersAsync();

        expect(process.send).toHaveBeenCalledTimes(1);
        expect(process.send).toHaveBeenCalledWith({ id: '-id-', error: '-error-', data: undefined });
    });

    /**
     *
     */
    test('message is called with an error', async () => {
        const remoteClient = {
            action: '-test-action-',
            execute: jest.fn().mockImplementation(() => {
                throw new Error('-error-');
            })
        };

        const sut = new NodeForkClient();
        sut.pluginHandler.setMainExecutionUnit(() => remoteClient);

        sut.start();

        onListeners.get('message').forEach((listener) => listener(listenerData));
        await jest.runAllTimersAsync();

        expect(process.send).toHaveBeenCalledTimes(1);
        expect(process.send).toHaveBeenCalledWith({ id: '-id-', error: '-error-', data: undefined });
    });

    /**
     *
     */
    test('unexpected error occurs with simple error', async () => {
        const remoteClient = {
            action: '-test-action-',
            execute: jest.fn()
        };

        const sut = new NodeForkClient();
        sut.pluginHandler.setMainExecutionUnit(() => remoteClient);

        sut.start();
        sut.start();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        onListeners.get('uncaughtException').forEach((listener) => listener(new Error('-unexpected-') as any));
        await jest.runAllTimersAsync();

        expect(process.send).toHaveBeenCalledTimes(1);
        expect(process.send).toHaveBeenCalledWith({ id: 'uncaughtException', error: '-unexpected-' });
    });

    /**
     *
     */
    test('unexpected error occurs with error', async () => {
        const remoteClient = {
            action: '-test-action-',
            execute: jest.fn()
        };

        const sut = new NodeForkClient();
        sut.pluginHandler.setMainExecutionUnit(() => remoteClient);

        sut.start();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        onListeners.get('uncaughtException').forEach((listener) => listener('-unexpected-' as any));
        await jest.runAllTimersAsync();

        expect(process.send).toHaveBeenCalledTimes(1);
        expect(process.send).toHaveBeenCalledWith({ id: 'uncaughtException', error: '-unexpected-' });
    });

    /**
     *
     */
    test('no remote client registered', async () => {
        const sut = new NodeForkClient();
        sut.start();

        onListeners.get('message').forEach((listener) => listener(listenerData));
        await jest.runAllTimersAsync();

        expect(process.send).toHaveBeenCalledTimes(1);
        expect(process.send).toHaveBeenCalledWith({ id: '-id-', error: `client '-mainClient-' not found` });
    });
});

/**
 *
 */
describe('asynchron', () => {
    /**
     *
     */
    test('message is called without any error', async () => {
        const remoteClient = {
            action: '-test-action-',
            execute: jest.fn().mockResolvedValue(response)
        };

        const sut = new NodeForkClient();
        sut.pluginHandler.setMainExecutionUnit(() => remoteClient);

        sut.start();

        onListeners.get('message').forEach((listener) => listener(listenerData));
        await jest.runAllTimersAsync();

        expect(process.send).toHaveBeenCalledTimes(1);
        expect(process.send).toHaveBeenCalledWith({ id: '-id-', error: undefined, data: response });
    });
});

/**
 *
 */
describe('with clientExecutionProxy', () => {
    /**
     *
     */
    test('one client proxy', async () => {
        const remoteClient = {
            action: '-test-proxy-action-',
            execute: jest.fn().mockResolvedValue(response)
        };

        const sut = new NodeForkClient();
        sut.pluginHandler.addExecutionUnit(remoteClient.action, () => remoteClient);
        sut.start();

        listenerData.data.action.name = '-test-proxy-action-';
        onListeners.get('message').forEach((listener) => listener(listenerData));
        await jest.runAllTimersAsync();

        expect(process.send).toHaveBeenCalledTimes(1);
        expect(process.send).toHaveBeenCalledWith({ id: '-id-', error: undefined, data: response });
    });

    /**
     *
     */
    test('two client proxy', async () => {
        const remoteClient1 = {
            action: '-test-proxy-1-action-',
            execute: jest.fn().mockResolvedValue(response)
        };

        const remoteClient2 = {
            action: '-test-proxy-2-action-',
            execute: jest.fn().mockResolvedValue(response)
        };

        const sut = new NodeForkClient();
        sut.pluginHandler.addExecutionUnit(remoteClient1.action, () => remoteClient1);
        sut.pluginHandler.addExecutionUnit(remoteClient2.action, () => remoteClient2);
        sut.start();

        listenerData.data.action.name = '-test-proxy-1-action-';
        onListeners.get('message').forEach((listener) => listener(listenerData));
        await jest.runAllTimersAsync();

        expect(process.send).toHaveBeenCalledTimes(1);
        expect(process.send).toHaveBeenCalledWith({ id: '-id-', error: undefined, data: response });
    });

    /**
     *
     */
    test('client proxy not found', async () => {
        const remoteClient1 = {
            action: '-test-proxy-x-action-',
            execute: jest.fn().mockResolvedValue(response)
        };

        const sut = new NodeForkClient();
        sut.pluginHandler.addExecutionUnit(remoteClient1.action, () => remoteClient1);
        sut.start();

        listenerData.data.action.name = '-test-proxy-action-';
        onListeners.get('message').forEach((listener) => listener(listenerData));
        await jest.runAllTimersAsync();

        expect(process.send).toHaveBeenCalledTimes(1);
        expect(process.send).toHaveBeenCalledWith({ id: '-id-', error: `client '-test-proxy-action-' not found` });
    });

    /**
     *
     */
    test('client proxy already exists', () => {
        const remoteClient = {
            action: '-test-proxy-x-action-',
            execute: jest.fn().mockResolvedValue(response)
        };

        const sut = new NodeForkClient();
        sut.pluginHandler.addExecutionUnit(remoteClient.action, () => remoteClient);
        sut.start();

        expect(() => sut.pluginHandler.addExecutionUnit(remoteClient.action, () => remoteClient)).toThrow(
            'client action -test-proxy-x-action- already exists'
        );
    });
});
