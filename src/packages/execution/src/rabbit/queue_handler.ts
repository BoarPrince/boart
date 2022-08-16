import assert from 'assert';

import amqp2 from 'amqplib';
import { Observable, Subject } from 'rxjs';

const EnvLoader = require('./env_loader');
const Utils = require('./utils');

/**
 *
 */
export interface QueueMessage {
    message: string;
    correlationId: string;
    fields: amqp2.MessageFields;
    properties: amqp2.MessageProperties;
    headers: amqp2.MessagePropertyHeaders;
}

/**
 *
 */
export interface QueueMessageConsumer {
    start: () => Promise<void>;
    messages: Observable<QueueMessage>;
    stop: () => Promise<void>;
}

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
export class QueueHandler {
    private connectionStatus = ConnectionStatus.Closed;
    private _hostname: string;
    private _username: string;
    private _password: string;
    private _port: number;
    private _connection: amqp2.Connection;
    private static QUEUEHANDLERSTORENAME = '###queue_handler###';

    /**
     *
     */
    private constructor() {
        this._hostname = EnvLoader.get('queue_handler_hostname');
        this._username = EnvLoader.get('queue_handler_username');
        this._password = EnvLoader.get('queue_handler_password');
        this._port = 5672;
        this._connection = null;
    }

    /**
     *
     */
    public get hostname(): string {
        return this._hostname;
    }

    /**
     *
     */
    public static get instance(): QueueHandler {
        // let queueHandler = gauge.dataStore.specStore.get(QueueHandler.QUEUEHANDLERSTORENAME);
        // if (!queueHandler) {
        //     queueHandler = new QueueHandler();
        //     gauge.dataStore.specStore.put(QueueHandler.QUEUEHANDLERSTORENAME, queueHandler);
        // }
        // return queueHandler;
        return null;
    }

    /**
     *
     */
    getConnection(): amqp2.Connection {
        if (!this._connection) {
            assert.fail('queue is not connected');
        }

        return this._connection;
    }

    /**
     *
     */
    async connect(): Promise<amqp2.Connection> {
        console.log(`connect to queue: ${this._hostname}, ${this._username}, ${this._password}`);

        try {
            this._connection = await amqp2.connect({
                hostname: this._hostname,
                username: this._username,
                password: this._password,
                port: this._port
            });
            this.connectionStatus = ConnectionStatus.Opened;
            return this._connection;
        } catch (error) {
            console.error('problem while connecting queue handler');
            throw error;
        }
    }

    /**
     *
     */
    async stop(): Promise<void> {
        if (!this._connection) {
            assert.fail('cannot close connection, because its not connected');
        }

        if (this.connectionStatus === ConnectionStatus.Closed) {
            return;
        }

        const sleep = (milliseconds) => {
            return new Promise<void>((resolve: () => any) => setTimeout(resolve(), milliseconds));
        };
        await sleep(1000);

        try {
            await this._connection.close();
            this.connectionStatus = ConnectionStatus.Closed;
        } catch (error) {
            console.error('problem while stopping queue handler');
            throw error;
        }
    }

    /**
     *
     */
    async deleteQueue(queueName): Promise<void> {
        const channel = await this.getConnection().createChannel();
        try {
            await channel.deleteQueue(queueName);
        } finally {
            await channel.close();
        }
    }

    /**
     *
     */
    async addQueue(queueName, isDurable = false): Promise<void> {
        const channel = await this.getConnection().createChannel();
        try {
            await channel.assertQueue(queueName, { durable: isDurable });
        } finally {
            await channel.close();
        }
    }

    /**
     *
     */
    async bindQueue(queueName: string, exchangeName: string, routing: string, isDurable = false): Promise<void> {
        const channel = await this.getConnection().createChannel();
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
        headers: any,
        correlationId: string,
        messageId: string
    ): Promise<boolean> {
        const channel = await this.getConnection().createChannel();
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
    async publishQueue(queueName: string, message: string, headers: any, correlationId: string, messageId: string): Promise<boolean> {
        const channel = await this.getConnection().createChannel();
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
    async consume(queueName: string): Promise<QueueMessageConsumer> {
        const channel = await this.getConnection().createChannel();
        await channel.checkQueue(queueName);

        let resolver = (): void => {
            /* do noting */
        };
        let rejecter = (reasony: any): void => {
            /* do noting */
        };

        // stopper
        let consumerTag: amqp2.Replies.Consume;
        const stopper = async (errorMessage: string = null): Promise<void> => {
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
        const messageSubject = new Subject<QueueMessage>();
        const startConsuming = async () => {
            try {
                consumerTag = await channel.consume(
                    queueName,
                    (msg: amqp2.ConsumeMessage) => {
                        try {
                            const message = Utils.tryParseJSON(msg.content.toString());
                            const consumerMessage = {
                                correlationId: msg.properties.correlationId || Utils.tryParseJSON(message).CorrelationId,
                                headers: msg.properties.headers,
                                fields: msg.fields,
                                properties: msg.properties,
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
        const starter = async (): Promise<void> =>
            new Promise<void>(async (resolve, reject) => {
                resolver = resolve;
                rejecter = reject;
                await startConsuming();
            });

        return {
            start: starter,
            messages: messageSubject,
            stop: stopper
        };
    }
}

module.exports = QueueHandler;
