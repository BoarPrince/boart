import fs from 'fs';

import { RabbitConsumeTableHandler } from '@boart/basic';
import { LocalContext, MarkdownTableReader, Runtime, RuntimeContext, StepContext, TestContext } from '@boart/core';
import { RabbitQueueHandler, RabbitQueueMessage, RabbitQueueMessageConsumer } from '@boart/execution';
import { StepReport } from '@boart/protocol';
import { Subject } from 'rxjs';

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
jest.mock('@boart/execution', () => {
    return {
        RabbitQueueHandler: class {
            static instance = {
                stop: jest.fn<Promise<void>, []>(),
                consume: jest.fn<Promise<RabbitQueueMessageConsumer>, [string]>().mockResolvedValue({} as RabbitQueueMessageConsumer)
            };
        }
    };
});

/**
 *
 */
beforeEach(() => {
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
type ConsumerMock = {
    consumer: RabbitQueueMessageConsumer;
    messages: Subject<RabbitQueueMessage>;
    start: {
        resolve: () => void;
        reject: (_: string) => void;
    };
    generateMessages: (messages: Subject<RabbitQueueMessage>) => void;
};
let consumerMock: ConsumerMock;

/**
 *
 */
beforeEach(async () => {
    const consumer = await RabbitQueueHandler.instance.consume('queue-name');
    const messages = new Subject<RabbitQueueMessage>();
    consumer.messages = messages;

    consumerMock = {
        consumer,
        messages,
        generateMessages: () => null,
        start: {
            resolve: null,
            reject: null
        }
    };

    consumer.start = () =>
        new Promise<void>((resolve, reject) => {
            consumerMock.start.resolve = resolve;
            consumerMock.start.reject = reject;
            consumerMock.generateMessages(consumerMock.messages);
        });

    consumer.stop = () => {
        consumerMock.start.resolve();
        return Promise.resolve();
    };
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
it('default consume', (done) => {
    const tableRows = MarkdownTableReader.convert(
        `| action       | value          |
         |--------------|----------------|
         | name         | queue          |
         | description  | Consume events |`
    );

    void sut.handler.process(tableRows).then(() => {
        expect(sut.handler.executionEngine.context.execution.data?.toString()).toEqual('x-x-x');
        done();
    });

    consumerMock.generateMessages = (msg) => {
        msg.next({
            message: 'x-x-x'
        });
    };
});
