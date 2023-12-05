import fs from 'fs';

import { RabbitConsumeTableHandler } from '@boart/basic';
import {
    LocalContext,
    MarkdownTableReader,
    ObjectContent,
    Runtime,
    RuntimeContext,
    RuntimeStatus,
    ScopedType,
    StepContext,
    Store,
    TestContext,
    TextContent,
    ValueReplaceArg,
    ValueReplacer,
    ValueReplacerHandler
} from '@boart/core';
import { createAmqplibMock, getAmqplibMock } from '@boart/execution.mock';
import { StepReport } from '@boart/protocol';

const sut = new RabbitConsumeTableHandler();

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
    (fs.readFileSync as jest.Mock).mockImplementation(() => '{}');
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
describe('default', () => {
    /**
     *
     */
    it('default consume', async () => {
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
             | queue        | queue    |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.execution.data).toBeInstanceOf(ObjectContent);
        expect(sut.handler.getExecutionEngine().context.execution.data.getValue()).toEqual({ a: 'x' });
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
            `| action       | value          |
             |--------------|----------------|
             | queue        | queue          |
             | count        | 2              |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.execution.data.getValue()).toEqual([{ a: '1' }, { b: '2' }]);
    });

    /**
     *
     */
    it('consume one event, using credentials', async () => {
        getAmqplibMock()
            .then((mockInstance) => {
                mockInstance.setMessageGenerator((generator) => {
                    generator.send({ content: { a: '1' } });
                });
            })
            .catch((error) => {
                throw error;
            });

        const tableRows = MarkdownTableReader.convert(
            `| action       | value |
             |--------------|-------|
             | queue        | queue |
             | username     | u     |
             | password     | p     |
             | hostname     | p     |
             | count        | 1     |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.config).toEqual({
            count_max: null,
            count_min: 1,
            hostname: 'p',
            password: 'p',
            port: 0,
            queue: 'queue',
            timeout: 10,
            username: 'u',
            vhost: '/'
        });

        const mock = await getAmqplibMock();

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(mock.connect).toHaveBeenNthCalledWith(1, {
            hostname: 'p',
            password: 'p',
            port: 0,
            username: 'u',
            vhost: '/'
        });
    });
});

/**
 *
 */
describe('filter', () => {
    /**
     *
     */
    it('one column, data filter', async () => {
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
            `| action                   | value |
             |--------------------------|-------|
             | queue                    | queue |
             | filter:expected:contains | x     |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.execution.data.getValue()).toEqual({ a: 'x' });
    });

    /**
     *
     */
    it('one column, header filter', async () => {
        getAmqplibMock()
            .then((mockInstance) => {
                mockInstance.setMessageGenerator((generator) => {
                    generator.send({
                        content: { a: 'x' },
                        properties: {
                            correlationId: '',
                            headers: { h1: 'x' }
                        }
                    });
                });
            })
            .catch((error) => {
                throw error;
            });

        const tableRows = MarkdownTableReader.convert(
            `| action                            | value |
             |-----------------------------------|-------|
             | filter:expected:header#headers.h1 | x     |
             | queue                             | queue |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.execution.data.getValue()).toEqual({ a: 'x' });
    });

    /**
     *
     */
    it('two column, header filter', async () => {
        getAmqplibMock()
            .then((mockInstance) => {
                mockInstance.setMessageGenerator((generator) => {
                    generator.send({
                        content: { a: '1' },
                        properties: {
                            headers: { h1: 'x' }
                        }
                    });
                    generator.send({
                        content: { a: '2' },
                        properties: {
                            headers: { h1: 'x' }
                        }
                    });
                });
            })
            .catch((error) => {
                throw error;
            });

        const tableRows = MarkdownTableReader.convert(
            `| action                            | value |
             |-----------------------------------|-------|
             | filter:expected:header#headers.h1 | x     |
             | count                             | 2     |
             | queue                             | queue |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.execution.data.getValue()).toEqual([{ a: '1' }, { a: '2' }]);
    });
});

/**
 *
 */
describe('expected', () => {
    /**
     *
     */
    it('expected contains - default', async () => {
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
            `| action                   | value |
             |--------------------------|-------|
             | queue                    | queue |
             | expected:contains        | x     |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.execution.data.getValue()).toEqual({ a: 'x' });
    });

    /**
     *
     */
    it('expected contains - selector', async () => {
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
            `| action     | value |
             |------------|-------|
             | queue      | queue |
             | expected#a | x     |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.execution.data.getValue()).toEqual({ a: 'x' });
    });

    /**
     *
     */
    it('expected contains - equals - selector', async () => {
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
            `| action            | value |
             |-------------------|-------|
             | queue             | queue |
             | expected:equals#a | x     |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.execution.data.getValue()).toEqual({ a: 'x' });
    });

    /**
     *
     */
    it('expected contains - not - selector - fails', async () => {
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
            `| action         | value |
             |----------------|-------|
             | queue          | queue |
             | expected:not#a | x     |`
        );

        await expect(sut.handler.process(tableRows)).rejects.toThrowError('error: expected#a\n\tnot: x\n\tactual: x');
    });

    /**
     *
     */
    it('expected contains - default - fails', async () => {
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
            `| action   | value |
             |----------|-------|
             | queue    | queue |
             | expected | y     |`
        );

        await expect(sut.handler.process(tableRows)).rejects.toThrowError('expected\n\texpected: y\n\tactual: {"a":"x"}');
    });
});

/**
 *
 */
describe('count', () => {
    /**
     *
     */
    beforeEach(() => {
        jest.useRealTimers();
    });

    /**
     *
     */
    it('expect mininum 2 messages', async () => {
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
            `| action | value |
             |--------|-------|
             | queue  | queue |
             | count  | 2     |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.execution.data).toBeInstanceOf(ObjectContent);
        expect(sut.handler.getExecutionEngine().context.execution.data.getValue()).toStrictEqual([{ a: 1 }, { a: 2 }]);
    });

    /**
     *
     */
    it('expect mininum 2 messages, but 3 message sent', async () => {
        getAmqplibMock()
            .then((mockInstance) => {
                mockInstance.setMessageGenerator((generator) => {
                    generator.send({ content: { a: 1 } });
                    generator.send({ content: { a: 2 } });
                    generator.send({ content: { a: 3 } });
                    generator.send({ content: { a: 4 } });
                });
            })
            .catch((error) => {
                throw error;
            });

        const tableRows = MarkdownTableReader.convert(
            `| action | value |
             |--------|-------|
             | queue  | queue |
             | count  | 2     |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.execution.data).toBeInstanceOf(ObjectContent);
        expect(sut.handler.getExecutionEngine().context.execution.data.getValue()).toStrictEqual([{ a: 1 }, { a: 2 }]);
    });

    /**
     *
     */
    it('expect mininum 2 messages, but only 1 received', async () => {
        getAmqplibMock()
            .then((mockInstance) => {
                mockInstance.setMessageGenerator((generator) => {
                    generator.send({ content: { a: '1' } });
                });
            })
            .catch((error) => {
                throw error;
            });

        const tableRows = MarkdownTableReader.convert(
            `| action       | value  |
             |--------------|--------|
             | queue        | queue  |
             | count        | 2      |
             | timeout      | 2      |`
        );

        await expect(sut.handler.process(tableRows)).rejects.toThrowError(
            'consumer timed out after 2 seconds, minimum 2 message(s) expected, 1 message(s) received'
        );
    });

    /**
     *
     */
    it('zero min count without max count definition not possible', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action | value |
             |--------|-------|
             | queue  | queue |
             | count  | 0     |`
        );

        await expect(() => sut.handler.process(tableRows)).rejects.toThrowError(
            `minimum message count can't be 0 if no maximum count is defined`
        );
    });

    /**
     *
     */
    it('max count with one message', async () => {
        getAmqplibMock()
            .then((mockInstance) => {
                mockInstance.setMessageGenerator((generator) => {
                    generator.send({ content: { a: 1 } });
                });
            })
            .catch((error) => {
                throw error;
            });

        const tableRows = MarkdownTableReader.convert(
            `| action    | value |
             |-----------|-------|
             | queue     | queue |
             | timeout   | 2     |
             | count:max | 1     |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.execution.data).toBeInstanceOf(ObjectContent);
        expect(sut.handler.getExecutionEngine().context.execution.data.getValue()).toStrictEqual({ a: 1 });
    });

    /**
     *
     */
    it('max count with two message', async () => {
        getAmqplibMock()
            .then((mockInstance) => {
                mockInstance.setMessageGenerator((generator) => {
                    generator.send({ content: { a: 1 } });
                    generator.send({ content: { b: 2 } });
                });
            })
            .catch((error) => {
                throw error;
            });

        const tableRows = MarkdownTableReader.convert(
            `| action    | value |
             |-----------|-------|
             | queue     | queue |
             | timeout   | 2     |
             | count:max | 2     |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.execution.data).toBeInstanceOf(ObjectContent);
        expect(sut.handler.getExecutionEngine().context.execution.data.getValue()).toStrictEqual([{ a: 1 }, { b: 2 }]);
    });

    /**
     *
     */
    it('max count with two message, but only one received', async () => {
        getAmqplibMock()
            .then((mockInstance) => {
                mockInstance.setMessageGenerator((generator) => {
                    generator.send({ content: { a: 1 } });
                });
            })
            .catch((error) => {
                throw error;
            });

        const tableRows = MarkdownTableReader.convert(
            `| action    | value |
             |-----------|-------|
             | queue     | queue |
             | timeout   | 2     |
             | count:max | 2     |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.execution.data).toBeInstanceOf(ObjectContent);
        expect(sut.handler.getExecutionEngine().context.execution.data.getValue()).toStrictEqual({ a: 1 });
    });

    /**
     *
     */
    it('max count with one message, but two consumed', async () => {
        getAmqplibMock()
            .then((mockInstance) => {
                mockInstance.setMessageGenerator((generator) => {
                    generator.send({ content: { a: 1 } });
                    generator.send({ content: { b: 2 } });
                });
            })
            .catch((error) => {
                throw error;
            });

        const tableRows = MarkdownTableReader.convert(
            `| action    | value |
             |-----------|-------|
             | queue     | queue |
             | timeout   | 2     |
             | count:max | 1     |`
        );

        await expect(() => sut.handler.process(tableRows)).rejects.toThrowError(`maximum 1 message(s) expected, but 2 message(s) received`);
    });

    /**
     *
     */
    it('exactly one message expected', async () => {
        getAmqplibMock()
            .then((mockInstance) => {
                mockInstance.setMessageGenerator((generator) => {
                    generator.send({ content: { a: 1 } });
                });
            })
            .catch((error) => {
                throw error;
            });

        const tableRows = MarkdownTableReader.convert(
            `| action    | value |
             |-----------|-------|
             | queue     | queue |
             | timeout   | 2     |
             | count:max | 1     |
             | count:min | 1     |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.execution.data).toBeInstanceOf(ObjectContent);
        expect(sut.handler.getExecutionEngine().context.execution.data.getValue()).toStrictEqual({ a: 1 });
    });

    /**
     *
     */
    it('min 1 and max 3 message expected', async () => {
        getAmqplibMock()
            .then((mockInstance) => {
                mockInstance.setMessageGenerator((generator) => {
                    generator.send({ content: { a: 1 } });
                    generator.send({ content: { b: 2 } });
                });
            })
            .catch((error) => {
                throw error;
            });

        const tableRows = MarkdownTableReader.convert(
            `| action    | value |
             |-----------|-------|
             | queue     | queue |
             | timeout   | 2     |
             | count:max | 3     |
             | count:min | 1     |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.execution.data).toBeInstanceOf(ObjectContent);
        expect(sut.handler.getExecutionEngine().context.execution.data.getValue()).toStrictEqual([{ a: 1 }, { b: 2 }]);
    });

    /**
     *
     */
    it('min 2 and max 3 message expected, but only one received', async () => {
        getAmqplibMock()
            .then((mockInstance) => {
                mockInstance.setMessageGenerator((generator) => {
                    generator.send({ content: { a: 1 } });
                });
            })
            .catch((error) => {
                throw error;
            });

        const tableRows = MarkdownTableReader.convert(
            `| action    | value |
             |-----------|-------|
             | queue     | queue |
             | timeout   | 2     |
             | count:max | 3     |
             | count:min | 2     |`
        );

        await expect(() => sut.handler.process(tableRows)).rejects.toThrowError(
            `consumer timed out after 2 seconds, minimum 2 message(s) expected, 1 message(s) received`
        );
    });

    /**
     *
     */
    it('min 1 and max 2 message expected, but three messages received', async () => {
        getAmqplibMock()
            .then((mockInstance) => {
                mockInstance.setMessageGenerator((generator) => {
                    generator.send({ content: { a: 1 } });
                    generator.send({ content: { b: 2 } });
                    generator.send({ content: { c: 3 } });
                });
            })
            .catch((error) => {
                throw error;
            });

        const tableRows = MarkdownTableReader.convert(
            `| action    | value |
             |-----------|-------|
             | queue     | queue |
             | timeout   | 2     |
             | count:max | 2     |
             | count:min | 1     |`
        );

        await expect(() => sut.handler.process(tableRows)).rejects.toThrowError(`maximum 2 message(s) expected, but 3 message(s) received`);
        expect(sut.handler.getExecutionEngine().context.execution.data.getValue()).toStrictEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
    });
});

/**
 *
 */
describe('transform & output', () => {
    /**
     *
     */
    it('transform - default', async () => {
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
            `| action          | value |
             |-----------------|-------|
             | queue           | queue |
             | transform:jpath | .a    |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.execution.transformed.getValue()).toEqual('x');
    });

    /**
     *
     */
    it('transform - out - default', async () => {
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
            `| action | value   |
             |--------|---------|
             | queue  | queue   |
             | store  | testout |`
        );

        await sut.handler.process(tableRows);

        expect(Store.instance.testStore.get('testout')).toBeInstanceOf(ObjectContent);
        expect(Store.instance.testStore.get('testout').toString()).toBe('{"a":"x"}');
    });

    /**
     *
     */
    it('transform - out - transformed', async () => {
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
            `| action          | value   |
             |-----------------|---------|
             | queue           | queue   |
             | transform:jpath | .a      |
             | store           | testout |`
        );

        await sut.handler.process(tableRows);

        expect(Store.instance.testStore.get('testout')).toBeInstanceOf(TextContent);
        expect(Store.instance.testStore.get('testout').toString()).toBe('x');
    });
});

// /**
//  *
//  */
describe('reports', () => {
    /**
     *
     */
    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(new Date('2000-01-01'));
    });

    /**
     *
     */
    it('report must written', async () => {
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
            `| action       | value          |
             |--------------|----------------|
             | queue        | queue          |
             | description  | Consume events |`
        );

        await sut.handler.process(tableRows);

        Runtime.instance.stepRuntime.current.id = 'id-id-id';
        Runtime.instance.stepRuntime.current.startTime = '2020-01-01T00:00:00.000Z';

        StepReport.instance.report();

        const writeFileMockCalls = (fs.writeFile as unknown as jest.Mock).mock.calls;
        expect(writeFileMockCalls.length).toBe(1);
        expect(JSON.parse(writeFileMockCalls[0][1] as string)).toStrictEqual({
            id: 'id-id-id',
            status: 2,
            type: 'rabbitConsume',
            startTime: '2020-01-01T00:00:00.000Z',
            description: 'Consume events',
            input: {
                'Rabbit consume (configuration)': {
                    description: 'Rabbit consume (configuration)',
                    type: 'object',
                    data: {
                        count_max: null,
                        count_min: 1,
                        queue: 'queue',
                        timeout: 10,
                        hostname: 'rabbitmq_hostname',
                        port: 0,
                        username: 'rabbitmq_username',
                        vhost: '/'
                    }
                }
            },
            links: [],
            result: {
                'Rabbit consume (received messages)': {
                    description: 'Rabbit consume (received messages)',
                    type: 'object',
                    data: [
                        {
                            header: {
                                correlationId: '',
                                fields: {},
                                properties: {},
                                headers: {},
                                receivedTime: '2000-01-01T00:00:00.000Z'
                            },
                            data: { a: 'x' }
                        }
                    ]
                },
                'Rabbit consume (header)': {
                    description: 'Rabbit consume (header)',
                    type: 'object',
                    data: {
                        correlationId: '', //
                        fields: {},
                        properties: {},
                        headers: {},
                        receivedTime: '2000-01-01T00:00:00.000Z'
                    }
                },
                'Rabbit consume (data)': { description: 'Rabbit consume (data)', type: 'object', data: { a: 'x' } }
            }
        });
    });

    /**
     *
     */
    it('report must written - two messages', async () => {
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
            `| action       | value          |
             |--------------|----------------|
             | queue        | queue          |
             | count        | 2              |
             | description  | Consume events |`
        );

        await sut.handler.process(tableRows);

        StepReport.instance.report();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        const reportData = JSON.parse((fs.writeFile as any).mock.calls[0][1]);

        expect(reportData['result']['Rabbit consume (received messages)']['data']).toStrictEqual([
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

    /**
     *
     */
    it('report must written - when error occurs while consuming', async () => {
        getAmqplibMock()
            .then((mockInstance) => {
                mockInstance.setMessageGenerator((generator) => {
                    generator.send({ content: { a: 1 } });
                    throw Error('custom error while consuming');
                });
            })
            .catch((error) => {
                throw error;
            });

        const tableRows = MarkdownTableReader.convert(
            `| action       | value          |
             |--------------|----------------|
             | queue        | queue          |
             | count        | 2              |
             | description  | Consume events |`
        );

        await expect(sut.handler.process(tableRows)).rejects.toThrowError('custom error while consuming');

        Runtime.instance.stepRuntime.current.id = 'id-id-id';
        Runtime.instance.stepRuntime.current.startTime = '2020-01-01T00:00:00.000Z';

        Runtime.instance.stepRuntime.notifyEnd({
            stackTrace: 'trace.trace.trace',
            errorMessage: 'custom error...',
            status: RuntimeStatus.status(true)
        });

        StepReport.instance.report();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        const reportData = JSON.parse((fs.writeFile as any).mock.calls[0][1]);
        delete reportData.duration;

        expect(reportData).toStrictEqual({
            id: 'id-id-id',
            errorMessage: 'custom error...',
            stackTrace: 'trace.trace.trace',
            status: 0,
            type: 'rabbitConsume',
            startTime: '2020-01-01T00:00:00.000Z',
            description: 'Consume events',
            input: {
                'Rabbit consume (configuration)': {
                    description: 'Rabbit consume (configuration)',
                    type: 'object',
                    data: {
                        count_max: null,
                        count_min: 2,
                        hostname: 'rabbitmq_hostname',
                        port: 0,
                        queue: 'queue',
                        timeout: 10,
                        username: 'rabbitmq_username',
                        vhost: '/'
                    }
                }
            },
            links: [],
            result: {
                'Rabbit consume (received messages)': {
                    description: 'Rabbit consume (received messages)',
                    type: 'object',
                    data: [
                        {
                            header: {
                                correlationId: '',
                                fields: {},
                                properties: {},
                                headers: {},
                                receivedTime: '2000-01-01T00:00:00.000Z'
                            },
                            data: { a: 1 }
                        }
                    ]
                },
                'Rabbit consume (header)': {
                    description: 'Rabbit consume (header)',
                    type: 'object',
                    data: {
                        correlationId: '', //
                        fields: {},
                        properties: {},
                        headers: {},
                        receivedTime: '2000-01-01T00:00:00.000Z'
                    }
                },
                'Rabbit consume (data)': {
                    description: 'Rabbit consume (data)',
                    type: 'object',
                    data: { a: 1 }
                }
            }
        });
    });
});
