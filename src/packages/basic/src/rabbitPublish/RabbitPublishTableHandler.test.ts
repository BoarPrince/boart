import fs from 'fs';

import { LocalContext, MarkdownTableReader, ObjectContent, Runtime, RuntimeContext, StepContext, Store, TestContext } from '@boart/core';
import { createAmqplibMock, getAmqplibMock } from '@boart/execution.mock';
import { StepReport } from '@boart/protocol';

import RabbitPublishTableHandler from './RabbitPublishTableHandler';

const sut = new RabbitPublishTableHandler();

/**
 *
 */
jest.mock('fs');

/**
 *
 */
jest.mock('@boart/core', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalModule = jest.requireActual('@boart/core');

    return {
        __esModule: true,
        ...originalModule,
        EnvLoader: class {
            static instance = {
                mapReportData: (filename: string) => filename,
                get: (env_var: string) => env_var
            };
        }
    };
});

/**
 *
 */
jest.mock('amqplib', () => {
    return {
        connect: jest.fn().mockImplementation((config) => createAmqplibMock().connect(config))
    };
});

/**
 * mock fs
 */
beforeAll(() => {
    (fs.readFileSync as jest.Mock).mockImplementation(() => '{}');
});

/**
 *
 */
beforeEach(() => {
    Store.instance.initTestStore({});
    sut.handler.executionEngine.initContext();

    Runtime.instance.runtime.notifyStart({} as RuntimeContext);
    Runtime.instance.localRuntime.notifyStart({} as LocalContext);
    Runtime.instance.testRuntime.notifyStart({} as TestContext);
    Runtime.instance.stepRuntime.notifyStart({} as StepContext);
});

/**
 *
 */
afterEach(() => {
    StepReport.instance.report();
});

/**
 *
 */
describe('default', () => {
    /**
     *
     */
    it('default publish', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action  | value    |
             |---------|----------|
             | queue   | queue    |
             | payload | {"a": 1} |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.executionEngine.context.preExecution.payload).toBeInstanceOf(ObjectContent);
        expect(sut.handler.executionEngine.context.preExecution.payload.getValue()).toEqual({ a: 1 });
    });

    /**
     *
     */
    it('default publish - exchange', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action   | value    |
             |----------|----------|
             | exchange | exchange |
             | payload  | {"a": 1} |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.executionEngine.context.preExecution.payload).toBeInstanceOf(ObjectContent);
        expect(sut.handler.executionEngine.context.preExecution.payload.getValue()).toEqual({ a: 1 });
    });

    /**
     *
     */
    it('default publish - exchange - with header', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action    | value       |
             |---------- |-------------|
             | exchange  | exchange    |
             | header    | {"h1": "x"} |
             | header#h2 | y           |
             | payload   | {"a": 1}    |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.executionEngine.context.preExecution.payload).toBeInstanceOf(ObjectContent);
        expect(sut.handler.executionEngine.context.preExecution.payload.getValue()).toEqual({ a: 1 });
        expect(sut.handler.executionEngine.context.preExecution.header.getValue()).toEqual({ h1: 'x', h2: 'y' });
    });

    /**
     *
     */
    it('default publish with selector', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action    | value |
             |-----------|-------|
             | queue     | queue |
             | payload#a | 1     |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.executionEngine.context.preExecution.payload).toBeInstanceOf(ObjectContent);
        expect(sut.handler.executionEngine.context.preExecution.payload.getValue()).toEqual({ a: 1 });
    });

    /**
     *
     */
    it('add property to existing payload', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action    | value    |
             |-----------|----------|
             | queue     | queue    |
             | payload   | {"a": 1} |
             | payload#b | 2        |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.executionEngine.context.preExecution.payload).toBeInstanceOf(ObjectContent);
        expect(sut.handler.executionEngine.context.preExecution.payload.getValue()).toEqual({ a: 1, b: 2 });
    });
});

/**
 *
 */
describe('data', () => {
    /**
     *
     */
    describe('queue', () => {
        /**
         *
         */
        it('default publish - queue', async () => {
            const tableRows = MarkdownTableReader.convert(
                `| action  | value    |
           |---------|----------|
           | queue   | queue    |
           | payload | {"a": 1} |`
            );

            await sut.handler.process(tableRows);

            const channelMock = (await getAmqplibMock()).channel;
            expect(channelMock.sendToQueue).toBeCalledWith('queue', Buffer.from(JSON.stringify({ a: 1 })), {
                correlationId: '',
                headers: {},
                messageId: '',
                persistent: false
            });
        });

        /**
         *
         */
        it('queue with messageid', async () => {
            const tableRows = MarkdownTableReader.convert(
                `| action    | value    |
                 |-----------|----------|
                 | queue     | qx       |
                 | messageId | m        |
                 | payload   | {"a": 1} |`
            );

            await sut.handler.process(tableRows);

            const channelMock = (await getAmqplibMock()).channel;
            expect(channelMock.sendToQueue).toBeCalledWith('qx', Buffer.from(JSON.stringify({ a: 1 })), {
                correlationId: '',
                headers: {},
                messageId: 'm',
                persistent: false
            });
        });

        /**
         *
         */
        it('queue with correlationId', async () => {
            const tableRows = MarkdownTableReader.convert(
                `| action        | value    |
                 |---------------|----------|
                 | queue         | qx       |
                 | correlationId | c        |
                 | payload       | {"a": 1} |`
            );

            await sut.handler.process(tableRows);

            const channelMock = (await getAmqplibMock()).channel;
            expect(channelMock.sendToQueue).toBeCalledWith('qx', Buffer.from(JSON.stringify({ a: 1 })), {
                correlationId: 'c',
                headers: {},
                messageId: '',
                persistent: false
            });
        });

        /**
         *
         */
        it('queue with header', async () => {
            const tableRows = MarkdownTableReader.convert(
                `| action    | value |
                 |-----------|-------|
                 | queue     | qx    |
                 | header#h1 | 1     |
                 | payload#a | 1     |`
            );

            await sut.handler.process(tableRows);

            const channelMock = (await getAmqplibMock()).channel;
            expect(channelMock.sendToQueue).toBeCalledWith('qx', Buffer.from(JSON.stringify({ a: 1 })), {
                correlationId: '',
                headers: {
                    h1: 1
                },
                messageId: '',
                persistent: false
            });
        });
    });

    /**
     *
     */
    describe('exchange', () => {
        /**
         *
         */
        it('default publish - exchange', async () => {
            const tableRows = MarkdownTableReader.convert(
                `| action   | value    |
           |----------|----------|
           | exchange | ex       |
           | payload  | {"a": 1} |`
            );

            await sut.handler.process(tableRows);

            const channelMock = (await getAmqplibMock()).channel;
            expect(channelMock.publish).toBeCalledWith('ex', '', Buffer.from(JSON.stringify({ a: 1 })), {
                correlationId: '',
                headers: {},
                messageId: '',
                persistent: false
            });
        });

        /**
         *
         */
        it('exchange with messageid', async () => {
            const tableRows = MarkdownTableReader.convert(
                `| action    | value    |
           |-----------|----------|
           | exchange  | ex       |
           | messageId | m        |
           | payload   | {"a": 1} |`
            );

            await sut.handler.process(tableRows);

            const channelMock = (await getAmqplibMock()).channel;
            expect(channelMock.publish).toBeCalledWith('ex', '', Buffer.from(JSON.stringify({ a: 1 })), {
                correlationId: '',
                headers: {},
                messageId: 'm',
                persistent: false
            });
        });

        /**
         *
         */
        it('exchange with correlationId', async () => {
            const tableRows = MarkdownTableReader.convert(
                `| action        | value    |
           |---------------|----------|
           | exchange      | ex       |
           | correlationId | c        |
           | payload       | {"a": 1} |`
            );

            await sut.handler.process(tableRows);

            const channelMock = (await getAmqplibMock()).channel;
            expect(channelMock.publish).toBeCalledWith('ex', '', Buffer.from(JSON.stringify({ a: 1 })), {
                correlationId: 'c',
                headers: {},
                messageId: '',
                persistent: false
            });
        });

        /**
         *
         */
        it('exchange with header', async () => {
            const tableRows = MarkdownTableReader.convert(
                `| action    | value |
           |-----------|-------|
           | exchange  | ex    |
           | header#h1 | 1     |
           | payload#a | 1     |`
            );

            await sut.handler.process(tableRows);

            const channelMock = (await getAmqplibMock()).channel;
            expect(channelMock.publish).toBeCalledWith('ex', '', Buffer.from(JSON.stringify({ a: 1 })), {
                correlationId: '',
                headers: {
                    h1: 1
                },
                messageId: '',
                persistent: false
            });
        });
    });
});

/**
 *
 */
describe('error handling', () => {
    /**
     *
     */
    it('queue and exchange cannot used together', () => {
        const tableRows = MarkdownTableReader.convert(
            `| action    | value    |
         |-----------|----------|
         | queue     | queue    |
         | exchange  | exchange |
         | payload   | {"a": 1} |`
        );

        expect(() => sut.handler.process(tableRows)).toThrowError(
            "key 'exchange' depends on key: 'type -> value:exchange', but it does not exist!"
        );
    });

    /**
     *
     */
    it('using queue depends on type => queue', () => {
        const tableRows = MarkdownTableReader.convert(
            `| action    | value    |
         |-----------|----------|
         | queue     | queue    |
         | type      | exchange |
         | payload   | {"a": 1} |`
        );

        expect(() => sut.handler.process(tableRows)).toThrowError(
            "key 'queue' depends on key: 'type -> value:queue', but it does not exist!"
        );
    });

    /**
     *
     */
    it('payload must be defined', () => {
        const tableRows = MarkdownTableReader.convert(
            `| action    | value    |
             |-----------|----------|
             | queue     | queue    |`
        );

        expect(() => sut.handler.process(tableRows)).toThrowError("Key 'payload' is required, but it's missing");
    });

    /**
     *
     */
    it('routingKey can only be used with type => exchange', () => {
        const tableRows = MarkdownTableReader.convert(
            `| action    | value |
             |-----------|-------|
             | queue     | queue |
             | routing   | xxx   |`
        );

        expect(() => sut.handler.process(tableRows)).toThrowError(
            "key 'routing' depends on key: 'type -> value:exchange', but it does not exist!"
        );
    });

    /**
     *
     */
    it('header must be well defined', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action   | value    |
         |----------|----------|
         | exchange | exchange |
         | header   | h1       |
         | payload  | {"a": 1} |`
        );

        await expect(async () => await sut.handler.process(tableRows)).rejects.toThrowError("header must key valued, but it's not");
    });
});
