import fs from 'fs';

import {
    LocalContext,
    MarkdownTableReader,
    ObjectContent,
    Runtime,
    RuntimeContext,
    ScopedType,
    StepContext,
    Store,
    StepReport,
    TestContext,
    ValueReplaceArg,
    ValueReplacer,
    ValueReplacerHandler
} from '@boart/core';
import { createAmqplibMock, getAmqplibMock } from '@boart/execution/src/index.mock';
import RabbitPublishTableHandler from './RabbitPublishTableHandler';
import { initialized } from '..';

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
        },
        TextLanguageHandler: class {
            static instance = {
                language: {
                    subscribe: () => null
                }
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
    initialized();
    (fs.readFileSync as jest.Mock).mockImplementation(() => '{}');
});

/**
 *
 */
beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
    Store.instance.testStore.clear();
    Runtime.instance.stepRuntime.notifyStart({} as StepContext);

    Store.instance.initTestStore({});
    Runtime.instance.runtime.notifyStart({} as RuntimeContext);
    Runtime.instance.localRuntime.notifyStart({} as LocalContext);
    Runtime.instance.testRuntime.notifyStart({} as TestContext);
    Runtime.instance.stepRuntime.notifyStart({} as StepContext);

    ValueReplacerHandler.instance.clear();
    const item: ValueReplacer = {
        name: '',
        priority: 0,
        config: {},
        scoped: ScopedType.False,
        replace: (ast: ValueReplaceArg): string => {
            return ast.qualifier.value === 'rabbitmq_port' ? '0' : ast.qualifier.value;
        }
    };
    ValueReplacerHandler.instance.add('env', item);
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

        expect(sut.handler.getExecutionEngine().context.preExecution.payload).toBeInstanceOf(ObjectContent);
        expect(sut.handler.getExecutionEngine().context.preExecution.payload.valueOf()).toStrictEqual({ a: 1 });
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

        expect(sut.handler.getExecutionEngine().context.preExecution.payload).toBeInstanceOf(ObjectContent);
        expect(sut.handler.getExecutionEngine().context.preExecution.payload.valueOf()).toEqual({ a: 1 });
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

        expect(sut.handler.getExecutionEngine().context.preExecution.payload).toBeInstanceOf(ObjectContent);
        expect(sut.handler.getExecutionEngine().context.preExecution.payload.valueOf()).toEqual({ a: 1 });
        expect(sut.handler.getExecutionEngine().context.preExecution.header.valueOf()).toEqual({ h1: 'x', h2: 'y' });
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

        expect(sut.handler.getExecutionEngine().context.preExecution.payload).toBeInstanceOf(ObjectContent);
        expect(sut.handler.getExecutionEngine().context.preExecution.payload.valueOf()).toEqual({ a: 1 });
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

        expect(sut.handler.getExecutionEngine().context.preExecution.payload).toBeInstanceOf(ObjectContent);
        expect(sut.handler.getExecutionEngine().context.preExecution.payload.valueOf()).toEqual({ a: 1, b: 2 });
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
        it('default publish - one routing', async () => {
            const tableRows = MarkdownTableReader.convert(
                `| action   | value    |
                 |----------|----------|
                 | exchange | ex       |
                 | routing  | r1       |
                 | payload  | {"a": 1} |`
            );

            await sut.handler.process(tableRows);

            const channelMock = (await getAmqplibMock()).channel;
            expect(channelMock.publish).toBeCalledWith('ex', 'r1', Buffer.from(JSON.stringify({ a: 1 })), {
                correlationId: '',
                headers: {},
                messageId: '',
                persistent: false
            });
        });

        /**
         *
         */
        it('default publish - two routings', async () => {
            const tableRows = MarkdownTableReader.convert(
                `| action   | value    |
                 |----------|----------|
                 | exchange | ex       |
                 | routing  | r1       |
                 | routing  | r2       |
                 | payload  | {"a": 1} |`
            );

            await sut.handler.process(tableRows);

            const channelMock = (await getAmqplibMock()).channel;
            expect(channelMock.publish).toBeCalledTimes(2);
            expect(channelMock.publish).toBeCalledWith('ex', 'r1', Buffer.from(JSON.stringify({ a: 1 })), {
                correlationId: '',
                headers: {},
                messageId: '',
                persistent: false
            });
            expect(channelMock.publish).toBeCalledWith('ex', 'r2', Buffer.from(JSON.stringify({ a: 1 })), {
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
describe('reporting', () => {
    /**
     *
     */
    beforeEach(() => {
        process.env['environment_reports_data_dir'] = '.';
    });

    /**
     *
     */
    it('report queue', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action      | value     |
             |-------------|-----------|
             | queue       | queue     |
             | description | test desc |
             | payload     | {"a": 1}  |`
        );

        await sut.handler.process(tableRows);

        Runtime.instance.stepRuntime.currentContext.id = 'id-id-id';
        StepReport.instance.report();

        const writeFileMockCalls = (fs.writeFile as unknown as jest.Mock).mock.calls;

        expect(JSON.parse(writeFileMockCalls[0][1] as string)).toStrictEqual({
            description: 'test desc',
            id: 'id-id-id',
            input: {
                'Rabbit publish (configuration)': {
                    data: {
                        hostname: 'rabbitmq_hostname',
                        port: 0,
                        queue_or_exhange: 'queue',
                        type: 'queue',
                        username: 'rabbitmq_username',
                        vhost: '/'
                    },
                    description: 'Rabbit publish (configuration)',
                    type: 'json'
                },
                'Rabbit publish (header)': {
                    data: {
                        correlationId: '',
                        header: {},
                        messageId: '',
                        routing: []
                    },
                    description: 'Rabbit publish (header)',
                    type: 'object'
                },
                'Rabbit publish to queue (payload)': {
                    data: {
                        a: 1
                    },
                    description: 'Rabbit publish to queue (payload)',
                    type: 'json'
                }
            },
            links: [],
            result: {},
            startTime: '2020-01-01T00:00:00.000Z',
            status: 2,
            type: 'rabbitPublish'
        });
    });

    /**
     *
     */
    it('report exchange', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action      | value     |
             |-------------|-----------|
             | exchange    | exchange  |
             | routing     | r1        |
             | description | test desc |
             | payload     | {"a": 1}  |`
        );

        await sut.handler.process(tableRows);

        Runtime.instance.stepRuntime.currentContext.id = 'id-id-id';
        StepReport.instance.report();

        const writeFileMockCalls = (fs.writeFile as unknown as jest.Mock).mock.calls;
        // expect(writeFileMockCalls.length).toBe(1);
        expect(JSON.parse(writeFileMockCalls[0][1] as string)).toStrictEqual({
            description: 'test desc',
            id: 'id-id-id',
            input: {
                'Rabbit publish (configuration)': {
                    data: {
                        hostname: 'rabbitmq_hostname',
                        port: 0,
                        queue_or_exhange: 'exchange',
                        type: 'exchange',
                        username: 'rabbitmq_username',
                        vhost: '/'
                    },
                    description: 'Rabbit publish (configuration)',
                    type: 'json'
                },
                'Rabbit publish (header)': {
                    data: {
                        correlationId: '',
                        header: {},
                        messageId: '',
                        routing: ['r1']
                    },
                    description: 'Rabbit publish (header)',
                    type: 'object'
                },
                'Rabbit publish to exchange (payload)': {
                    data: {
                        a: 1
                    },
                    description: 'Rabbit publish to exchange (payload)',
                    type: 'json'
                }
            },
            links: [],
            result: {},
            startTime: '2020-01-01T00:00:00.000Z',
            status: 2,
            type: 'rabbitPublish'
        });
    });

    /**
     *
     */
    it('report with header', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action         | value     |
             |----------------|-----------|
             | exchange       | exchange  |
             | header#traceId | t1        |
             | description    | test desc |
             | payload        | {"a": 1}  |`
        );

        await sut.handler.process(tableRows);

        Runtime.instance.stepRuntime.currentContext.id = 'id-id-id';
        StepReport.instance.report();

        const writeFileMockCalls = (fs.writeFile as unknown as jest.Mock).mock.calls;
        // expect(writeFileMockCalls.length).toBe(1);
        expect(JSON.parse(writeFileMockCalls[0][1] as string)).toStrictEqual({
            description: 'test desc',
            id: 'id-id-id',
            input: {
                'Rabbit publish (configuration)': {
                    data: {
                        hostname: 'rabbitmq_hostname',
                        port: 0,
                        queue_or_exhange: 'exchange',
                        type: 'exchange',
                        username: 'rabbitmq_username',
                        vhost: '/'
                    },
                    description: 'Rabbit publish (configuration)',
                    type: 'json'
                },
                'Rabbit publish (header)': {
                    data: {
                        correlationId: '',
                        header: { traceId: 't1' },
                        messageId: '',
                        routing: []
                    },
                    description: 'Rabbit publish (header)',
                    type: 'object'
                },
                'Rabbit publish to exchange (payload)': {
                    data: {
                        a: 1
                    },
                    description: 'Rabbit publish to exchange (payload)',
                    type: 'json'
                }
            },
            links: [],
            result: {},
            startTime: '2020-01-01T00:00:00.000Z',
            status: 2,
            type: 'rabbitPublish'
        });
    });

    /**
     *
     */
    it('report with multiple descriptions', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action      | value            |
             |-------------|------------------|
             | queue       | queue1           |
             | description | test desc line 1 |
             |             | test desc line 2 |
             | payload     | {"a": 1}         |`
        );

        await sut.handler.process(tableRows);

        Runtime.instance.stepRuntime.currentContext.id = 'id-id-id';
        StepReport.instance.report();

        const writeFileMockCalls = (fs.writeFile as unknown as jest.Mock).mock.calls;
        expect(writeFileMockCalls.length).toBe(1);
        expect(JSON.parse(writeFileMockCalls[0][1] as string).description).toStrictEqual('test desc line 1\ntest desc line 2');
    });
});

/**
 *
 */
describe('error handling', () => {
    /**
     *
     */
    it('queue and exchange cannot used together', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action    | value    |
             |-----------|----------|
             | queue     | queue    |
             | exchange  | exchange |
             | payload   | {"a": 1} |`
        );

        await expect(() => sut.handler.process(tableRows)).rejects.toThrowError(
            "Only one of the keys 'queue or exchange' must exists, but 'queue and exchange' exists"
        );
    });

    /**
     *
     */
    it('using queue depends on type => queue', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action    | value    |
         |-----------|----------|
         | queue     | queue    |
         | type      | exchange |
         | payload   | {"a": 1} |`
        );

        await expect(() => sut.handler.process(tableRows)).rejects.toThrowError(
            "key 'queue' depends on key: 'type -> action:queue', but it does not exist!"
        );
    });

    /**
     *
     */
    it('payload must be defined', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action    | value    |
             |-----------|----------|
             | queue     | queue    |`
        );

        await expect(() => sut.handler.process(tableRows)).rejects.toThrowError("Key 'payload' is required, but it's missing");
    });

    /**
     *
     */
    it('routingKey can only be used with type => exchange', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action    | value    |
             |-----------|----------|
             | queue     | queue    |
             | payload   | {"a": 1} |
             | routing   | xxx      |`
        );

        await expect(() => sut.handler.process(tableRows)).rejects.toThrowError(
            "key 'routing' depends on key: 'type -> action:exchange', but it does not exist!"
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

        await expect(() => sut.handler.process(tableRows)).rejects.toThrowError("header must key valued, but it's not");
    });
});
