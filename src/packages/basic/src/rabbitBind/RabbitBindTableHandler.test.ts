import fs from 'fs';

import { LocalContext, MarkdownTableReader, Runtime, RuntimeContext, RuntimeStatus, StepContext, Store, TestContext } from '@boart/core';
import { createAmqplibMock, getAmqplibMock } from '@boart/execution.mock';
import { StepReport } from '@boart/protocol';

import RabbitBindTableHandler from './RabbitBindTableHandler';

const sut = new RabbitBindTableHandler();

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
    it('default bind', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action   | value    |
             |----------|----------|
             | exchange | exchange |
             | queue    | queue    |
             | routing  | routing  |`
        );

        const mock = await getAmqplibMock();
        await sut.handler.process(tableRows);

        expect(sut.handler.executionEngine.context.config.exchange).toBe('exchange');
        expect(sut.handler.executionEngine.context.config.queue).toBe('queue');
        expect(sut.handler.executionEngine.context.config.queue_create).toBe(true);
        expect(sut.handler.executionEngine.context.config.queue_delete).toBe(true);

        expect(mock.channel.assertQueue).toBeCalledWith('queue', { durable: false });
        expect(mock.channel.bindQueue).toBeCalledWith('queue', 'exchange', 'routing');
    });

    /**
     *
     */
    it('multiple routins are possible', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action   | value    |
             |----------|----------|
             | exchange | exchange |
             | queue    | queue    |
             | routing  | routing1 |
             | routing  | routing2 |`
        );

        const mock = await getAmqplibMock();
        await sut.handler.process(tableRows);

        expect(mock.channel.bindQueue).toBeCalledTimes(2);
        expect(mock.channel.bindQueue).toBeCalledWith('queue', 'exchange', 'routing1');
        expect(mock.channel.bindQueue).toBeCalledWith('queue', 'exchange', 'routing2');
    });

    /**
     *
     */
    it('default credentials', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action   | value    |
             |----------|----------|
             | exchange | exchange |
             | queue    | queue    |`
        );

        const mock = await getAmqplibMock();
        await sut.handler.process(tableRows);

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(mock.connect).toHaveBeenNthCalledWith(1, {
            hostname: '${env?:rabbitmq_hostname}',
            password: '${env?:rabbitmq_password}',
            username: '${env?:rabbitmq_username}',
            port: 5672,
            vhost: '/'
        });
    });

    /**
     *
     */
    it('custom credentials', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action   | value    |
             |----------|----------|
             | exchange | exchange |
             | queue    | queue    |
             | username | u        |
             | password | p        |
             | hostname | h        |`
        );

        const mock = await getAmqplibMock();
        await sut.handler.process(tableRows);

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(mock.connect).toHaveBeenNthCalledWith(1, {
            hostname: 'h',
            password: 'p',
            username: 'u',
            port: 5672,
            vhost: '/'
        });
    });

    /**
     *
     */
    it('not adding a queue', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action       | value    |
             |----------    |----------|
             | exchange     | exchange |
             | queue        | queue    |
             | queue:create | false    |`
        );

        await sut.handler.process(tableRows);

        const mock = await getAmqplibMock();
        expect(mock.channel.assertQueue).not.toHaveBeenCalled();
    });

    /**
     *
     */
    it('delete queue after test', (done) => {
        const tableRows = MarkdownTableReader.convert(
            `| action       | value    |
             |----------    |----------|
             | exchange     | exchange |
             | queue        | queue    |`
        );

        void getAmqplibMock().then((mock) => {
            const subscription = mock.on.deleteQueue.subscribe(() => {
                expect(mock.channel.deleteQueue).toHaveBeenCalled();
                subscription.unsubscribe();
                done();
            });
        });

        void sut.handler.process(tableRows).then(() => {
            Runtime.instance.testRuntime.notifyEnd({ status: RuntimeStatus.succeed });
        });
    });
});
