import { RemoteResponse } from '../proxy/RemoteResponse';
import { NodeForkClient } from './NodeForkClient';

/**
 *
 */
type OnListeners = Map<string, Array<(value: unknown) => void>>;

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
let response: RemoteResponse;
let onListeners: OnListeners;

/**
 *
 */
beforeEach(() => {
    jest.useFakeTimers();
    onListeners = new Map<string, Array<(value: unknown) => void>>();
    process = mockChildProcess(onListeners);

    response = {
        execution: {
            data: {},
            header: {}
        },
        reportItems: []
    };
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
            execute: jest.fn().mockReturnValue(response)
        };

        const sut = new NodeForkClient(remoteClient);
        sut.start();

        onListeners.get('message').forEach((listener) => listener({ message: '-message-' }));
        await jest.runAllTimersAsync();

        expect(process.send).toHaveBeenCalledTimes(1);
        expect(process.send).toHaveBeenCalledWith({ id: undefined, error: undefined, data: response });
    });

    /**
     *
     */
    test('message is called with a simple error', async () => {
        const remoteClient = {
            execute: jest.fn().mockImplementation(() => {
                throw '-error-';
            })
        };

        const sut = new NodeForkClient(remoteClient);
        sut.start();

        onListeners.get('message').forEach((listener) => listener({ message: '-message-' }));
        await jest.runAllTimersAsync();

        expect(process.send).toHaveBeenCalledTimes(1);
        expect(process.send).toHaveBeenCalledWith({ id: undefined, error: '-error-', data: undefined });
    });

    /**
     *
     */
    test('message is called with an error', async () => {
        const remoteClient = {
            execute: jest.fn().mockImplementation(() => {
                throw new Error('-error-');
            })
        };

        const sut = new NodeForkClient(remoteClient);
        sut.start();

        onListeners.get('message').forEach((listener) => listener({ message: '-message-' }));
        await jest.runAllTimersAsync();

        expect(process.send).toHaveBeenCalledTimes(1);
        expect(process.send).toHaveBeenCalledWith({ id: undefined, error: '-error-', data: undefined });
    });

    /**
     *
     */
    test('unexpected error occurs with simple error', async () => {
        const remoteClient = {
            execute: jest.fn()
        };

        const sut = new NodeForkClient(remoteClient);
        sut.start();
        sut.start();

        onListeners.get('uncaughtException').forEach((listener) => listener(new Error('-unexpected-')));
        await jest.runAllTimersAsync();

        expect(process.send).toHaveBeenCalledTimes(1);
        expect(process.send).toHaveBeenCalledWith({ id: 'uncaughtException', error: '-unexpected-' });
    });

    /**
     *
     */
    test('unexpected error occurs with error', async () => {
        const remoteClient = {
            execute: jest.fn()
        };

        const sut = new NodeForkClient(remoteClient);
        sut.start();

        onListeners.get('uncaughtException').forEach((listener) => listener('-unexpected-'));
        await jest.runAllTimersAsync();

        expect(process.send).toHaveBeenCalledTimes(1);
        expect(process.send).toHaveBeenCalledWith({ id: 'uncaughtException', error: '-unexpected-' });
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
            execute: jest.fn().mockResolvedValue(response)
        };

        const sut = new NodeForkClient(remoteClient);
        sut.start();

        onListeners.get('message').forEach((listener) => listener({ message: '-message-' }));
        await jest.runAllTimersAsync();

        expect(process.send).toHaveBeenCalledTimes(1);
        expect(process.send).toHaveBeenCalledWith({ id: undefined, error: undefined, data: response });
    });
});
