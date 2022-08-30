import { Runtime } from '@boart/core';
import { connect, Connection, ConsumeMessage, Replies } from 'amqplib';
import { Subject } from 'rxjs';

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

    /**
     *
     */
    private constructor() {
        // singleton constructor must be private
    }

    /**
     *
     */
    public static set config(config: RabbitConfiguration) {
        globalThis._rabbitQueueConfig = { ...RabbitQueueHandler.config, ...config };
    }

    /**
     *
     */
    public static get config(): RabbitConfiguration {
        if (!globalThis._rabbitQueueConfig) {
            globalThis._rabbitQueueConfig = {
                hostname: '',
                username: '',
                password: '',
                port: 5672,
                vhost: '/'
            } as RabbitConfiguration;
        }
        return globalThis._rabbitQueueConfig;
    }

    /*
     *
     */
    public static get instance(): RabbitQueueHandler {
        if (!globalThis._rabbitQueueHandlerInstance) {
            const instance = new RabbitQueueHandler();
            globalThis._rabbitQueueHandlerInstance = instance;
            const subscription = Runtime.instance.testRuntime.onEnd().subscribe(() => {
                subscription.unsubscribe();
                delete globalThis._rabbitQueueHandlerInstance;
            });
        }
        return globalThis._rabbitQueueHandlerInstance;
    }

    /**
     *
     */
    private tryParseJSON(content: string, failedContent = null): object {
        try {
            return JSON.parse(content);
        } catch (error) {
            return failedContent || content;
        }
    }

    /**
     *
     */
    async getConnection(): Promise<Connection> {
        if (!this.connection) {
            await this.connect();
        }

        return this.connection;
    }

    /**
     *
     */
    async connect(config?: RabbitConfiguration): Promise<Connection> {
        try {
            this.connection = await connect(config || RabbitQueueHandler.config);
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
        const channel = await (await this.getConnection()).createChannel();
        try {
            await channel.deleteQueue(queueName);
        } finally {
            await channel.close();
        }
    }

    /**
     *
     */
    async addQueue(queueName: string, isDurable = false, deleteAfterUsage = true): Promise<void> {
        const channel = await (await this.getConnection()).createChannel();
        try {
            await channel.assertQueue(queueName, { durable: isDurable });
        } finally {
            await channel.close();
        }
    }

    /**
     *
     */
    async bindQueue(queueName: string, exchangeName: string, routing: string, isDurable = false, deleteAfterUsage = true): Promise<void> {
        const channel = await (await this.getConnection()).createChannel();
        try {
            await channel.assertQueue(queueName, { durable: isDurable });
            await channel.bindQueue(queueName, exchangeName, routing);
        } finally {
            await channel.close();
        }
    }

    /**
     *
     */
    async publishExhange(
        exchangName: string,
        routingKey: string,
        message: string,
        headers: Record<string, string>,
        correlationId: string,
        messageId: string
    ): Promise<boolean> {
        const channel = await (await this.getConnection()).createChannel();
        try {
            return channel.publish(exchangName, routingKey, Buffer.from(message), {
                persistent: false,
                headers,
                correlationId,
                messageId
            });
        } finally {
            await channel.close();
        }
    }

    /**
     *
     */
    async publishQueue(
        queueName: string,
        message: string,
        headers: Record<string, string>,
        correlationId: string,
        messageId: string
    ): Promise<boolean> {
        const channel = await (await this.getConnection()).createChannel();
        try {
            return channel.sendToQueue(queueName, Buffer.from(message), {
                persistent: false,
                headers,
                correlationId,
                messageId
            });
        } finally {
            await channel.close();
        }
    }

    /**
     *
     */
    async consume(queueName: string): Promise<RabbitQueueMessageConsumer> {
        const channel = await (await this.getConnection()).createChannel();
        await channel.checkQueue(queueName);

        let resolver = (): void => null;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let rejecter = (_: string): void => null;

        // finisher
        let consumerTag: Replies.Consume;
        const finisher = async (errorMessage: string = null): Promise<void> => {
            try {
                if (!!consumerTag) {
                    await channel.cancel(consumerTag.consumerTag);
                }
                if (!!errorMessage) {
                    rejecter(errorMessage);
                } else {
                    resolver();
                }
            } catch (error) {
                rejecter(error);
            } finally {
                await channel.close();
            }
        };

        // consuming
        const messageSubject = new Subject<RabbitQueueMessage>();
        const startConsuming = async () => {
            try {
                consumerTag = await channel.consume(
                    queueName,
                    (msg: ConsumeMessage) => {
                        try {
                            const message = JSON.stringify(msg.content);
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
                            messageSubject.next(consumerMessage);
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

        // starter
        const starter = (): Promise<void> =>
            Promise.race([
                new Promise<void>((resolve: () => void, reject: (error: string) => void) => {
                    resolver = resolve;
                    rejecter = reject;
                }),
                startConsuming()
            ]);

        return {
            start: starter,
            messages: messageSubject,
            stop: finisher
        };
    }
}
