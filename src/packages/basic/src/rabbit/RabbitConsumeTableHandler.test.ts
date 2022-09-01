import fs from 'fs';

import { RabbitConsumeTableHandler } from '@boart/basic';
import { LocalContext, MarkdownTableReader, Runtime, RuntimeContext, RuntimeStatus, StepContext, TestContext } from '@boart/core';
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
        }
    };
});

/**
 *
 */
jest.mock('amqplib', () => {
    return {
        connect: jest.fn().mockImplementation(() => createAmqplibMock().connect())
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
         | name         | queue    |`
    );

    await sut.handler.process(tableRows);

    expect(sut.handler.executionEngine.context.execution.data.getValue()).toEqual({ a: 'x' });
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
         | name         | queue          |
         | count        | 2              |`
    );

    await sut.handler.process(tableRows);

    expect(sut.handler.executionEngine.context.execution.data.getValue()).toEqual([{ a: '1' }, { b: '2' }]);
});

/**
 *
 */
it('consume one event, but two events expected', async () => {
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
         | name         | queue  |
         | count        | 2      |
         | timeout      | 2      |`
    );

    await expect(sut.handler.process(tableRows)).rejects.toThrowError(
        'consumer timed out after 2 seconds, 2 message(s) expected, 1 message(s) received'
    );
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
         | name         | queue          |
         | description  | Consume events |`
    );

    await sut.handler.process(tableRows);

    Runtime.instance.stepRuntime.current.id = 'id-id-id';
    Runtime.instance.stepRuntime.current.startTime = '2020-01-01T00:00:00.000Z';

    StepReport.instance.report();
    expect(fs.writeFile).toBeCalledWith(
        'id-id-id.json',
        JSON.stringify({
            id: 'id-id-id',
            status: 2,
            type: 'rabbitConsume',
            startTime: '2020-01-01T00:00:00.000Z',
            description: 'Consume events',
            input: {
                'Rabbit consume (configuration)': {
                    description: 'Rabbit consume (configuration)',
                    type: 'json',
                    data: '{"name":"queue","timeout":10,"messageCount":1}'
                }
            },
            result: {
                'Rabbit consume (received message)': {
                    description: 'Rabbit consume (received message)',
                    type: 'object',
                    data: [{ header: '{"correlationId":"","fields":{},"properties":{},"headers":{}}', data: '{"a":"x"}' }]
                },
                'Rabbit consume (header)': {
                    description: 'Rabbit consume (header)',
                    type: 'json',
                    data: '{"correlationId":"","fields":{},"properties":{},"headers":{}}'
                },
                'Rabbit consume (paylaod)': { description: 'Rabbit consume (paylaod)', type: 'json', data: '{"a":"x"}' }
            }
        }),
        'utf-8',
        expect.any(Function)
    );
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
         | name         | queue          |
         | description  | Consume events |`
    );

    await sut.handler.process(tableRows);

    StepReport.instance.report();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    const reportData = JSON.parse((fs.writeFile as any).mock.calls[0][1]);

    expect(reportData['result']['Rabbit consume (received message)']['data']).toStrictEqual([
        { data: '{"a":1}', header: '{"correlationId":"","fields":{},"properties":{},"headers":{}}' },
        { data: '{"a":2}', header: '{"correlationId":"","fields":{},"properties":{},"headers":{}}' }
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
         | name         | queue          |
         | count        | 2             |
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
        description: 'Consume events',
        errorMessage: 'custom error...',
        id: 'id-id-id',
        input: {
            'Rabbit consume (configuration)': {
                data: '{"name":"queue","timeout":10,"messageCount":"2"}',
                description: 'Rabbit consume (configuration)',
                type: 'json'
            }
        },
        result: {
            'Rabbit consume (header)': {
                data: '{"correlationId":"","fields":{},"properties":{},"headers":{}}',
                description: 'Rabbit consume (header)',
                type: 'json'
            },
            'Rabbit consume (paylaod)': { data: '{"a":1}', description: 'Rabbit consume (paylaod)', type: 'json' },
            'Rabbit consume (received message)': {
                data: [{ data: '{"a":1}', header: '{"correlationId":"","fields":{},"properties":{},"headers":{}}' }],
                description: 'Rabbit consume (received message)',
                type: 'object'
            }
        },
        stackTrace: 'trace.trace.trace',
        startTime: '2020-01-01T00:00:00.000Z',
        status: 0,
        type: 'rabbitConsume'
    });
});
