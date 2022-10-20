import { Semaphore, Store } from '@boart/core';
import { Channel, connect, Connection, ConsumeMessage, Replies } from 'amqplib';

import { RabbitConfiguration } from './RabbitConfiguration';
import { RabbitQueueMessage } from './RabbitQueueMessage';
import { RabbitQueueMessageConsumer } from './RabbitQueueMessageConsumer';

/**
 *
 */
enum ConnectionStatus {
    Closed,
    Opened
}

/**
 *
 */
export class RabbitQueueHandler {
    private connectionStatus = ConnectionStatus.Closed;
    private connection: Connection;
    private config: RabbitConfiguration;

    /**
     *
     */
    private constructor() {
        // singleton constructor must be private
    }

    /**
     *
     */
    private static getInstanceKeyId(config: RabbitConfiguration): string {
        return (
            '#RABBITMQ#' +
            Object.values(config)
                .map((v) => v)
                .join('#')
        );
    }

    /**
     *
     */
    private async execute<TReturnType>(runable: (channel: Channel) => Promise<TReturnType>): Promise<TReturnType> {
        const connection = await this.getConnection();
        const channel = await this.createChannel(connection);

        return new Promise((resolve, reject) => {
            connection.on('error', (error) => reject(error));
            runable(channel)
                .then((rValue: TReturnType) => resolve(rValue))
                .catch((error) => {
                    channel.close().finally(() => reject(error));
                });
        });
    }

    /*
     *
     */
    public static getInstance(config: RabbitConfiguration): RabbitQueueHandler {
        const instanceKey = RabbitQueueHandler.getInstanceKeyId(config);

        let instance = Store.instance.testStore.store.get(instanceKey) as RabbitQueueHandler;
        if (!instance) {
            instance = new RabbitQueueHandler();
            instance.config = config;
            Store.instance.testStore.store.put(instanceKey, instance);
        }
        return instance;
    }

    /**
     *
     */
    private async getConnection(): Promise<Connection> {
        if (!this.connection) {
            await this.connect();
        }

        return this.connection;
    }

    /**
     *
     */
    private async createChannel(connection: Connection): Promise<Channel> {
        const channel = await connection.createChannel();
        const closeAction = channel.close.bind(channel);

        let isClosed = false;

        channel.close = () => {
            if (isClosed) {
                return;
            } else {
                isClosed = true;
                return closeAction();
            }
        };
        return channel;
    }

    /**
     *
     */
    private async connect(): Promise<Connection> {
        try {
            this.connection = await connect({
                username: this.config.username,
                password: this.config.password,
                hostname: this.config.hostname,
                vhost: this.config.vhost,
                port: this.config.port
            });
            this.connectionStatus = ConnectionStatus.Opened;
            return this.connection;
        } catch (error) {
            console.error('problem while connecting queue handler');
            throw error;
        }
    }

    /**
     *
     */
    async stop(): Promise<void> {
        if (!this.connection) {
            throw Error('cannot close connection, because its not connected');
        }

        if (this.connectionStatus === ConnectionStatus.Closed) {
            return;
        }

        const sleep = (milliseconds: number) => {
            return new Promise<void>((resolve: () => void) => setTimeout(resolve, milliseconds));
        };
        await sleep(1000);

        try {
            await this.connection.close();
            this.connectionStatus = ConnectionStatus.Closed;
        } catch (error) {
            console.error('problem while stopping queue handler');
            throw error;
        }
    }

    /**
     *
     */
    async deleteQueue(queueName: string): Promise<void> {
        await this.execute(async (channel) => {
            await channel.deleteQueue(queueName);
        });
    }

    /**
     *
     */
    async addQueue(queueName: string, isDurable = false): Promise<void> {
        await this.execute(async (channel) => {
            await channel.assertQueue(queueName, { durable: isDurable });
        });
    }

    /**
     *
     */
    async bindQueue(queueName: string, exchangeName: string, routing = ''): Promise<void> {
        await this.execute(async (channel) => {
            await channel.bindQueue(queueName, exchangeName, routing);
        });
    }

    /**
     *
     */
    async sendToExchange(
        exchangName: string,
        routingKey: string,
        message: string,
        headers: Record<string, unknown>,
        correlationId: string,
        messageId: string
    ): Promise<boolean> {
        // eslint-disable-next-line @typescript-eslint/require-await
        return await this.execute(async (channel) => {
            return channel.publish(exchangName, routingKey, Buffer.from(message), {
                persistent: false,
                headers,
                correlationId,
                messageId
            });
        });
    }

    /**
     *
     */
    async sendToQueue(
        queueName: string,
        message: string,
        headers: Record<string, unknown>,
        correlationId: string,
        messageId: string
    ): Promise<boolean> {
        // eslint-disable-next-line @typescript-eslint/require-await
        return await this.execute(async (channel) => {
            return channel.sendToQueue(queueName, Buffer.from(message), {
                persistent: false,
                headers,
                correlationId,
                messageId
            });
        });
    }

    /**
     *
     */
    async consume(queueName: string): Promise<RabbitQueueMessageConsumer> {
        let resolver = (): void => null;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let rejecter = (_: string | unknown): void => null;

        const connection = await this.getConnection();
        const channel = await this.createChannel(connection);

        // add amqplib specific error handling
        connection.on('error', (error) => rejecter(error));

        await channel.checkQueue(queueName);

        /**
         *
         */
        const messageConsumer: RabbitQueueMessageConsumer = {
            start: null,
            messageHandler: () => Promise.resolve(),
            stop: null
        };

        // finisher
        let consumerTag: Replies.Consume;
        messageConsumer.stop = async (errorMessage: string = null): Promise<void> => {
            // stop consuming from listener
            messageConsumer.messageHandler = () => Promise.resolve();
            try {
                if (!!consumerTag) {
                    await channel.cancel(consumerTag.consumerTag);
                }
                if (!!errorMessage) {
                    rejecter(errorMessage);
                } else {
                    // start is blocked and will resolved now
                    resolver();
                }
            } catch (error) {
                rejecter(error);
            } finally {
                await channel.close();
            }
        };

        // starter
        messageConsumer.start = (): Promise<void> => {
            const startPromise = new Promise<void>((resolve: () => void, reject: (error: string) => void) => {
                resolver = resolve;
                rejecter = reject;
            });
            void startConsuming();
            return startPromise;
        };

        const startConsuming = async () => {
            const semaphore = new Semaphore();

            try {
                consumerTag = await channel.consume(
                    queueName,
                    (msg: ConsumeMessage) => {
                        try {
                            const message = msg.content.toString();
                            const consumerMessage: RabbitQueueMessage = {
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                correlationId: msg.properties.correlationId,
                                headers: msg.properties.headers,
                                fields: { ...msg.fields },
                                properties: { ...msg.properties },
                                receivedTime: Date.now(),
                                message
                            };
                            delete consumerMessage.properties.correlationId;
                            delete consumerMessage.properties.headers;

                            semaphore.take((done) => {
                                messageConsumer
                                    ?.messageHandler(consumerMessage)
                                    .then(() => done())
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                                    .catch((error) => messageConsumer.stop(error));
                            });
                        } catch (error) {
                            rejecter(error);
                        }
                    },
                    { noAck: true }
                );
            } catch (error) {
                rejecter(error);
            }
        };

        return messageConsumer;
    }
}
