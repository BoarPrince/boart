import { connect } from 'amqplib';

/**
 *
 */
export interface ConsumeMessage {
    fields: Record<string, string | number>;
    content: any;
    properties: {
        correlationId: string;
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
export interface AmqplibMock {
    connect(): Promise<any>;
    setMessageGenerator(generatorStarter: MessageGeneratorStarter);
}

const consumerPromise = {
    resolver: null,
    rejecter: null
};

const consumerResult = {
    consumerTag: '-done-'
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
let messageGeneratorStarter: MessageGeneratorStarter = (): void => {};

const channel = {
    checkQueue: jest.fn<Promise<void>, [string]>(() => Promise.resolve()),
    cancel: jest.fn<Promise<void>, [string]>(() => {
        consumerPromise.resolver(consumerResult);
        return Promise.resolve();
    }),
    close: jest.fn<Promise<void>, []>(() => {
        consumerPromise.resolver(consumerResult);
        return Promise.resolve();
    }),
    consume: jest.fn<Promise<typeof consumerResult>, [string, (msg: ConsumeMessage) => void]>((_, consumer) => {
        return new Promise((resolve, reject) => {
            consumerPromise.resolver = resolve;
            consumerPromise.rejecter = reject;

            messageGeneratorStarter({
                send: (msg: ConsumeMessage): void => consumer(msg)
            });
        });
    })
};

const connection = {
    close: jest.fn<Promise<void>, []>().mockReturnValue(Promise.resolve()),
    createChannel: jest.fn(() => Promise.resolve(channel)),
    createConfirmChannel: jest.fn(),
    connection: {
        serverProperties: null
    },
    setMessageGenerator: (generatorStarter: MessageGeneratorStarter) => {
        messageGeneratorStarter = generatorStarter;
    }
};

/**
 *
 */
export function createAmqplibMock(): AmqplibMock {
    return {
        setMessageGenerator: (generatorStarter: MessageGeneratorStarter) => {
            messageGeneratorStarter = generatorStarter;
        },
        connect: jest.fn(() => {
            return Promise.resolve(connection);
        })
    } as AmqplibMock;
}

/**
 *
 */
export function getAmqplibMock(): Promise<AmqplibMock> {
    return connect('') as unknown as Promise<AmqplibMock>;
}
