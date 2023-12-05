import fs from 'fs';

import { RabbitListenerTableHandler } from '@boart/basic';
import {
    LocalContext,
    MarkdownTableReader,
    Runtime,
    RuntimeContext,
    RuntimeResultContext,
    ScopedType,
    StepContext,
    Store,
    TestContext,
    ValueReplaceArg,
    ValueReplacer,
    ValueReplacerHandler
} from '@boart/core';
import { createAmqplibMock, getAmqplibMock } from '@boart/execution.mock';
import { StepReport } from '@boart/protocol';

const sut = new RabbitListenerTableHandler();

/**
 *
 */
jest.mock('fs');

/**
 *
 */
jest.mock<typeof import('@boart/core')>('@boart/core', () => {
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
// eslint-disable-next-line jest/no-untyped-mock-factory
jest.mock('amqplib', () => {
    return {
        connect: jest.fn().mockImplementation((config) => createAmqplibMock().connect(config))
    };
});

/**
 *
 */
describe('default', () => {
    /**
     * mock fs
     */
    beforeAll(() => {
        (fs.readFileSync as jest.Mock).mockImplementation(() => '{}');
        jest.useFakeTimers().setSystemTime(new Date('2000-01-01'));
    });

    /**
     *
     */
    beforeEach(() => {
        Runtime.instance.runtime.notifyStart({} as RuntimeContext);
        Runtime.instance.localRuntime.notifyStart({} as LocalContext);
        Runtime.instance.testRuntime.notifyStart({} as TestContext);
        Runtime.instance.stepRuntime.notifyStart({} as StepContext);

        ValueReplacerHandler.instance.clear();
        const item: ValueReplacer = {
            name: '',
            priority: 0,
            config: null,
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
    it('default listen queue', async () => {
        getAmqplibMock()
            .then((mockInstance) => {
                mockInstance.setMessageGenerator((generator) => {
                    generator.send({ content: { a: 'x' } });
                });
            })
            .catch((error) => {
                throw error;
            });

        const tableRows = MarkdownTableReader.convert(
            `| action       | value    |
             |--------------|----------|
             | store:name   | myStore  |
             | queue        | myQueue  |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.config).toEqual({
            exchange: '',
            hostname: 'rabbitmq_hostname',
            password: 'rabbitmq_password',
            port: 0,
            queue: 'myQueue',
            routing: [],
            storeName: 'myStore',
            username: 'rabbitmq_username',
            vhost: '/'
        });

        const queueData = Store.instance.testStore.get('myStore');
        expect(queueData.valueOf()).toEqual([
            {
                data: { a: 'x' },
                header: {
                    correlationId: '',
                    fields: {},
                    headers: {},
                    message: undefined,
                    properties: {},
                    receivedTime: '2000-01-01T00:00:00.000Z'
                }
            }
        ]);
    });

    /**
     *
     */
    it('default listen exchange', async () => {
        getAmqplibMock()
            .then((mockInstance) => {
                mockInstance.setMessageGenerator((generator) => {
                    generator.send({ content: { a: 'x' } });
                });
            })
            .catch((error) => {
                throw error;
            });

        const tableRows = MarkdownTableReader.convert(
            `| action     | value      |
             |------------|------------|
             | store:name | myStore    |
             | routing    | myRouting  |
             | exchange   | myExchange |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.config).toEqual({
            exchange: 'myExchange',
            hostname: 'rabbitmq_hostname',
            password: 'rabbitmq_password',
            port: 0,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            queue: expect.anything(),
            routing: ['myRouting'],
            storeName: 'myStore',
            username: 'rabbitmq_username',
            vhost: '/'
        });

        const queueData = Store.instance.testStore.get('myStore');
        expect(queueData.valueOf()).toEqual([
            {
                data: { a: 'x' },
                header: {
                    correlationId: '',
                    fields: {},
                    headers: {},
                    message: undefined,
                    properties: {},
                    receivedTime: '2000-01-01T00:00:00.000Z'
                }
            }
        ]);
    });

    /**
     *
     */
    it('consume two events', async () => {
        getAmqplibMock()
            .then((mockInstance) => {
                mockInstance.setMessageGenerator((generator) => {
                    generator.send({ content: { a: '1' } });
                    generator.send({ content: { b: '2' } });
                });
            })
            .catch((error) => {
                throw error;
            });

        const tableRows = MarkdownTableReader.convert(
            `| action     | value    |
             |------------|----------|
             | store:name | myStore  |
             | queue      | myQueue  |`
        );

        await sut.handler.process(tableRows);

        const queueData = Store.instance.testStore.get('myStore');
        expect(queueData.valueOf()).toEqual([
            {
                data: { a: '1' },
                header: {
                    correlationId: '',
                    fields: {},
                    headers: {},
                    message: undefined,
                    properties: {},
                    receivedTime: '2000-01-01T00:00:00.000Z'
                }
            },
            {
                data: { b: '2' },
                header: {
                    correlationId: '',
                    fields: {},
                    headers: {},
                    message: undefined,
                    properties: {},
                    receivedTime: '2000-01-01T00:00:00.000Z'
                }
            }
        ]);
    });

    /**
     *
     */
    it('exchange requires routing definition', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action     | value      |
             |------------|------------|
             | store:name | myStore    |
             | exchange   | myExchange |`
        );

        await expect(() => sut.handler.process(tableRows)).rejects.toThrowError(
            `key 'exchange' depends on 'routing', but it does not exist!`
        );
    });

    /**
     *
     */
    it('routing requires exchange definition', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action     | value      |
             |------------|------------|
             | store:name | myStore    |
             | queue      | myQueue    |
             | routing    | myRouting  |`
        );

        await expect(() => sut.handler.process(tableRows)).rejects.toThrowError(
            `key 'routing' depends on 'exchange', but it does not exist!`
        );
    });

    /**
     *
     */
    it('exchange or queue definition is required', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action     | value      |
             |------------|------------|
             | store:name | myStore    |
             | routing    | myRouting  |`
        );

        await expect(() => sut.handler.process(tableRows)).rejects.toThrow(
            `One of the following keys 'queue, exchange' must exists, but no one exists`
        );
    });

    /**
     *
     */
    it('report must written - one message', async () => {
        getAmqplibMock()
            .then((mockInstance) => {
                mockInstance.setMessageGenerator((generator) => {
                    generator.send({ content: { a: 1 } });
                    generator.send({ content: { a: 2 } });
                });
            })
            .catch((error) => {
                throw error;
            });

        const tableRows = MarkdownTableReader.convert(
            `| action      | value    |
             |-------------|----------|
             | store:name  | myStore  |
             | description | test desc|
             | queue       | myQueue  |`
        );

        await sut.handler.process(tableRows);

        StepReport.instance.report();
        Runtime.instance.testRuntime.notifyEnd({} as RuntimeResultContext);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        const calls = (fs.writeFile as any).mock.calls;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        const reportData = JSON.parse(calls[0][1]);

        expect(reportData).toContainKey('result');
        expect(reportData.result).toContainKey('Rabbit listener (received messages)');
        expect(Object.values(reportData.result as object)[0]).toContainKey('data');

        const data = Object.values(reportData.result as object)[0].data as object;
        expect(data).toStrictEqual([
            {
                data: { a: 1 },
                header: { correlationId: '', fields: {}, properties: {}, headers: {}, receivedTime: '2000-01-01T00:00:00.000Z' }
            },
            {
                data: { a: 2 },
                header: { correlationId: '', fields: {}, properties: {}, headers: {}, receivedTime: '2000-01-01T00:00:00.000Z' }
            }
        ]);
    });
});
