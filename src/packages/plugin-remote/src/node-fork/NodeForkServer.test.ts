import EventEmitter from 'events';
import * as child_process from 'child_process';
import * as crypto from 'crypto';
import { Readable } from 'stream';
import { NodeForkServer } from './NodeForkServer';
import { PluginRequest, PluginResponse } from '@boart/core';
import { NodeForkResponse } from '@boart/plugin';

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
let messageFromClient: NodeForkResponse;
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
            execution: {
                data: null,
                header: null
            },
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

        const sut = new NodeForkServer('-action-', '-path-');

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
            }
        };

        await sut.execute(messageToClient, {} as PluginResponse);
        expect(onSend).toHaveBeenCalledWith({
            data: messageToClient,
            id: '0-0-0-0-0'
        });
    });

    /**
     *
     */
    test('check message from client', async () => {
        const sut = new NodeForkServer('-action-', '-path-');

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
            }
        };

        jest.spyOn(process, 'on').mockImplementation((_, listener: (message: NodeForkResponse) => void) => {
            listener(messageFromClient);
            return process;
        });

        const response = {} as PluginResponse;
        await sut.execute(messageToClient, response);
        expect(response).toStrictEqual(messageFromClient.data);
    });

    /**
     *
     */
    test('client stdout calls console.log', () => {
        new NodeForkServer('-action-', '-path-');
        const onConsoleLog = jest.spyOn(console, 'log');

        process.stdout.emit('data', '-log-');

        expect(onConsoleLog).toHaveBeenCalledWith('child:', '-path-', '-log-');
    });

    /**
     *
     */
    test('client stderr calls console.log', () => {
        new NodeForkServer('-action-', '-path-');
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
        }
    };

    /**
     *
     */
    test('id must be the same', async () => {
        const sut = new NodeForkServer('-action-', '-path-');

        const response: PluginResponse = {
            execution: {
                data: {},
                header: {}
            },
            reportItems: []
        };

        // check if id is ok
        let executePromise = sut.execute(messageToClient, response);
        let timeoutPromise = new Promise((_, reject) => setTimeout(() => reject('timer first'), 200));

        await expect(Promise.race([timeoutPromise, executePromise])).resolves.not.toThrow();

        // check if id is not ok
        messageFromClient.id = '1-1-1-1-1-1';
        executePromise = sut.execute(messageToClient, response);
        timeoutPromise = new Promise((_, reject) => setTimeout(() => reject('timer first'), 200));

        // check that the response promise does not resolve
        await expect(Promise.race([timeoutPromise, executePromise])).rejects.toBe('timer first');
    });

    /**
     *
     */
    test('unhandled expections must be catched', async () => {
        const sut = new NodeForkServer('-action-', '-path-');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messageFromClient = { id: 'uncaughtException' as any, error: 'any exception', data: null };
        const response: PluginResponse = {
            execution: {
                data: {},
                header: {}
            },
            reportItems: []
        };

        await expect(sut.execute(messageToClient, response)).rejects.toBe('any exception');
    });

    /**
     *
     */
    test('exception from client', async () => {
        const sut = new NodeForkServer('-action-', '-path-');

        messageFromClient = { id: UUID, error: 'any exception', data: null };
        const response: PluginResponse = {
            execution: {
                data: {},
                header: {}
            },
            reportItems: []
        };

        await expect(sut.execute(messageToClient, response)).rejects.toBe('any exception');
    });
});
