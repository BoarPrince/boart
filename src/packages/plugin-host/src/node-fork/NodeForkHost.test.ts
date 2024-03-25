import EventEmitter from 'events';
import * as child_process from 'child_process';
import * as crypto from 'crypto';
import { Readable } from 'stream';
import { NodeForkHost } from './NodeForkHost';
import { PluginRequest, RemotePluginResponse } from '@boart/core';

/**
 *
 */
jest.mock('child_process');
jest.mock('crypto');

/**
 *
 */
const mockChildProcess = (): child_process.ChildProcess => {
    const proc = new EventEmitter() as child_process.ChildProcess;

    proc.stdout = new EventEmitter() as Readable;
    proc.stderr = new EventEmitter() as Readable;
    proc.send = () => true;

    jest.spyOn(child_process, 'fork').mockReturnValueOnce(proc);
    return proc;
};

/**
 *
 */
const UUID: crypto.UUID = '0-0-0-0-0';
let messageFromClient: RemotePluginResponse;
let process: child_process.ChildProcess;

/**
 *
 */
beforeEach(() => {
    // use always the same UUID
    jest.spyOn(crypto, 'randomUUID').mockImplementation(() => {
        return UUID;
    });

    process = mockChildProcess();

    // ignore send message to client
    jest.spyOn(process, 'send');

    // fake message from client
    jest.spyOn(process, 'on').mockImplementation((_, listener: (message: unknown) => void) => {
        listener(messageFromClient);
        return process;
    });

    messageFromClient = {
        id: UUID,
        error: null,
        data: {
            context: undefined,
            reportItems: []
        }
    };
});

/**
 *
 */
describe('client - server - communication', () => {
    /**
     *
     */
    test('default', async () => {
        const onSend = jest.spyOn(process, 'send');

        const sut = new NodeForkHost('-action-', '-path-');

        const messageToClient: PluginRequest = {
            context: {
                config: { conf: 'a' },
                preExecution: {
                    payload: {}
                },
                execution: {
                    data: {},
                    header: {},
                    transformed: {}
                }
            },
            action: {
                name: '-action-',
                ast: null
            },
            value: null,
            additionalValue: null
        };

        await sut.execute(messageToClient);

        expect(onSend).toHaveBeenCalledWith({
            data: messageToClient,
            id: '0-0-0-0-0'
        });
    });

    /**
     *
     */
    test('check message from client', async () => {
        const sut = new NodeForkHost('-action-', '-path-');

        const messageToClient: PluginRequest = {
            context: {
                config: {},
                preExecution: {
                    payload: {}
                },
                execution: {
                    data: {},
                    header: {},
                    transformed: {}
                }
            },
            action: {
                name: '-action-',
                ast: null
            },
            value: null,
            additionalValue: null
        };

        jest.spyOn(process, 'on').mockImplementation((_, listener: (message: RemotePluginResponse) => void) => {
            listener(messageFromClient);
            return process;
        });

        const response = await sut.execute(messageToClient);
        expect(response).toStrictEqual(messageFromClient.data);
    });

    /**
     *
     */
    test('client stdout calls console.log', () => {
        new NodeForkHost('-action-', '-path-');
        const onConsoleLog = jest.spyOn(console, 'log');

        process.stdout.emit('data', '-log-');

        expect(onConsoleLog).toHaveBeenCalledWith('child:', '-path-', '-log-');
    });

    /**
     *
     */
    test('client stderr calls console.log', () => {
        new NodeForkHost('-action-', '-path-');
        const onConsoleError = jest.spyOn(console, 'error');

        process.stderr.emit('data', '-error-');

        expect(onConsoleError).toHaveBeenCalledWith('child:', '-path-', '-error-');
    });
});

/**
 *
 */
describe('error handing', () => {
    const messageToClient: PluginRequest = {
        context: {
            config: {},
            preExecution: {
                payload: {}
            },
            execution: {
                data: {},
                header: {},
                transformed: {}
            }
        },
        action: {
            name: '-action-',
            ast: null
        },
        value: null,
        additionalValue: null
    };

    /**
     *
     */
    test('id must be the same', async () => {
        const sut = new NodeForkHost('-action-', '-path-');

        // check if id is ok
        let responsePromise = sut.execute(messageToClient);
        let timeoutPromise = new Promise((_, reject) => setTimeout(() => reject('timer first'), 200));

        await expect(Promise.race([timeoutPromise, responsePromise])).resolves.not.toThrow();

        // check if id is not ok
        messageFromClient.id = '1-1-1-1-1-1';
        responsePromise = sut.execute(messageToClient);
        timeoutPromise = new Promise((_, reject) => setTimeout(() => reject('timer first'), 200));

        // check that the response promise does not resolve
        await expect(Promise.race([timeoutPromise, responsePromise])).rejects.toBe('timer first');
    });

    /**
     *
     */
    test('unhandled expections must be catched', async () => {
        const sut = new NodeForkHost('-action-', '-path-');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messageFromClient = { id: 'uncaughtException' as any, error: 'any exception', data: null };
        await expect(sut.execute(messageToClient)).rejects.toBe('any exception');
    });

    /**
     *
     */
    test('exception from client', async () => {
        const sut = new NodeForkHost('-action-', '-path-');

        messageFromClient = { id: UUID, error: 'any exception', data: null };
        await expect(sut.execute(messageToClient)).rejects.toBe('any exception');
    });
});
