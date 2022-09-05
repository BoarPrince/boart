import { Observable, Subject } from 'rxjs';

import { RabbitBindConfigContext } from '../rabbitBind/RabbitBindContext';

/**
 *
 */
export interface ConsumeMessage {
    fields?: Record<string, string | number>;
    content: any;
    properties?: {
        correlationId?: string;
        headers: Record<string, string>;
    };
}

/**
 *
 */
export interface MessageGenerator {
    send(messages: ConsumeMessage): void;
}

/**
 *
 */
export type MessageGeneratorStarter = (source: MessageGenerator) => void;

/**
 *
 */
const consumerPromise = {
    resolver: null,
    rejecter: null
};

/**
 *
 */
const consumerResult = {
    consumerTag: '-done-'
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
let messageGeneratorStarter: MessageGeneratorStarter = (): void => {};

/**
 *
 */
const on = {
    deleteQueue: new Subject<string>(),
    assertQueue: new Subject<Record<string, unknown>>()
};

/**
 *
 */
const channel = {
    checkQueue: jest.fn<Promise<void>, [string]>(() => Promise.resolve()),
    bindQueue: jest.fn<Promise<void>, [string, string, string]>(() => Promise.resolve()),
    assertQueue: jest.fn<Promise<void>, [string, object]>((queueName, options) => {
        on.assertQueue.next({
            queueName,
            options
        });
        return Promise.resolve();
    }),
    deleteQueue: jest.fn<Promise<void>, [string]>((queueName) => {
        on.deleteQueue.next(queueName);
        return Promise.resolve();
    }),
    cancel: jest.fn<Promise<void>, [string]>(() => {
        if (!!consumerPromise.resolver) {
            consumerPromise.resolver(consumerResult);
        }
        return Promise.resolve();
    }),
    close: jest.fn<Promise<void>, []>(() => {
        if (!!consumerPromise.resolver) {
            consumerPromise.resolver(consumerResult);
        }
        return Promise.resolve();
    }),
    consume: jest.fn<Promise<typeof consumerResult>, [string, (msg: ConsumeMessage) => void]>((_, consumer) => {
        return new Promise((resolve, reject) => {
            consumerPromise.resolver = resolve;
            consumerPromise.rejecter = reject;

            messageGeneratorStarter({
                send: (msg: ConsumeMessage): void =>
                    consumer({
                        fields: {},
                        properties: {
                            correlationId: '',
                            headers: {}
                        },
                        ...msg
                    })
            });
        });
    })
};

/**
 *
 */
type Observe<T> = {
    [Property in keyof T]: Observable<T>;
};

/**
 *
 */
export interface AmqplibMock {
    connect(config: RabbitBindConfigContext): Promise<unknown>;
    setMessageGenerator(generatorStarter: MessageGeneratorStarter);
    channel: typeof channel;
    // on: Observe<typeof on>;
    on: typeof on;
}

/**
 *
 */
const connection = {
    close: jest.fn<Promise<void>, []>().mockReturnValue(Promise.resolve()),
    createChannel: jest.fn(() => Promise.resolve(channel)),
    createConfirmChannel: jest.fn(),
    connect: jest.fn<Promise<any>, []>(() => {
        return Promise.resolve(connection);
    })
};

/**
 *
 */
export function createAmqplibMock() {
    return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        connect: connection.connect
    };
}

/**
 *
 */
export function getAmqplibMock(): Promise<AmqplibMock> {
    return Promise.resolve({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        connect: connection.connect,
        setMessageGenerator: (generatorStarter: MessageGeneratorStarter) => {
            messageGeneratorStarter = generatorStarter;
        },
        channel,
        on
    });
}
