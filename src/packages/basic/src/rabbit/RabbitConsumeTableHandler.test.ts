import fs from 'fs';

import { RabbitConsumeTableHandler } from '@boart/basic';
import { LocalContext, MarkdownTableReader, Runtime, RuntimeContext, StepContext, TestContext } from '@boart/core';
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
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

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
it('default consume 2', async () => {
    getAmqplibMock()
        .then((mockInstance) => {
            mockInstance.setMessageGenerator((generator) => {
                generator.send({
                    fields: {},
                    content: { a: 'x' },
                    properties: {
                        correlationId: '',
                        headers: {}
                    }
                });
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

    expect(sut.handler.executionEngine.context.execution.data.getValue()).toEqual({ a: 'x' });
});
