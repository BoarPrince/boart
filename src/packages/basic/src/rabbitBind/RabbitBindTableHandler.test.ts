import fs from 'fs';

import {
    LocalContext,
    MarkdownTableReader,
    Runtime,
    RuntimeContext,
    RuntimeStatus,
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
                get: (env_var: string) => {
                    console.log('env:', env_var);
                    return env_var;
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
    it('default bind', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action   | value    |
             |----------|----------|
             | exchange | exchange |
             | queue    | queue    |`
        );

        const mock = await getAmqplibMock();
        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.config.exchange).toBe('exchange');
        expect(sut.handler.getExecutionEngine().context.config.queue).toBe('queue');
        expect(sut.handler.getExecutionEngine().context.config.queue_create).toBe(true);
        expect(sut.handler.getExecutionEngine().context.config.queue_delete).toBe(true);

        expect(mock.channel.assertQueue).toBeCalledWith('queue', { durable: false });
        expect(mock.channel.bindQueue).toBeCalledWith('queue', 'exchange', '');
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
            hostname: 'rabbitmq_hostname',
            password: 'rabbitmq_password',
            username: 'rabbitmq_username',
            port: 0,
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
            port: 0,
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
