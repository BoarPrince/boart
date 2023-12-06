import { ExecutionUnit, Runtime, Store, StoreMap } from '@boart/core';
import { RowTypeValue, UUIDGenerator } from '@boart/core-impl';
import { RabbitQueueHandler, RabbitQueueMessage, RabbitQueueMessageConsumer } from '@boart/execution';
import { StepReport } from '@boart/protocol';

import { RabbitListenerContext } from './RabbitListenerContext';

/**
 *
 */
export class RabbitListenerExecutionUnit implements ExecutionUnit<RabbitListenerContext, RowTypeValue<RabbitListenerContext>> {
    public description = {
        id: 'rabbit:listener:unit',
        title: 'listening on rabbit queues/exchanges',
        description: null,
        examples: null
    };

    /**
     * Binds a queue to the defined exchange and creates an temporary queue
     * Or just do nothing if only a queue is defined.
     *
     * @param context containing all runtime informations
     */
    private async bindQueue(context: RabbitListenerContext): Promise<void> {
        if (!!context.config.queue) {
            // nothing to do, because no binding is necessary
            return;
        }

        let isTempQueue = false;
        const handlerInstance = RabbitQueueHandler.getInstance(context.config);
        if (!context.config.queue) {
            // if listening to exchange (no queue), a temporary queue needs to be created
            isTempQueue = true;
            context.config.queue = 'temp.' + new UUIDGenerator().generate(null);
            await handlerInstance.addQueue(context.config.queue);
        }

        if (!context.config.routing || !context.config.routing.length) {
            await handlerInstance.bindQueue(context.config.queue, context.config.exchange, '');
        } else {
            for (const routing of context.config.routing) {
                await handlerInstance.bindQueue(context.config.queue, context.config.exchange, routing);
            }
        }

        if (isTempQueue === true) {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const subscription = Runtime.instance.testRuntime.onEnd().subscribe(async (_) => {
                await handlerInstance.deleteQueue(context.config.queue);
                subscription.unsubscribe();
            });
        }
    }

    /**
     *
     */
    private async startConsuming(context: RabbitListenerContext): Promise<RabbitQueueMessageConsumer> {
        const handlerInstance = RabbitQueueHandler.getInstance(context.config);
        const consumer = await handlerInstance.consume(context.config.queue);

        const receivedMessages = [];
        const resultData = StepReport.instance.getResultData('Rabbit listener (received messages)', 'object');

        /**
         *
         * @param queueMessage message from rabbit queue
         */
        // eslint-disable-next-line @typescript-eslint/require-await
        const messageConsumer = async (queueMessage: RabbitQueueMessage) => {
            const receivedMessage = {
                header: { ...queueMessage, message: undefined },
                data: queueMessage.message
            };
            receivedMessages.push(receivedMessage);

            Store.instance.testStore.put(StoreMap.getStoreIdentifier(context.config.storeName), receivedMessages);
            resultData.add(receivedMessage);
        };

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        const subscription = Runtime.instance.testRuntime.onEnd().subscribe(async (_) => {
            await consumer.stop();
            subscription.unsubscribe();
        });

        consumer.messageHandler = (queueMessage: RabbitQueueMessage) => messageConsumer(queueMessage);
        return consumer;
    }

    /**
     *
     */
    private async initConsume(context: RabbitListenerContext): Promise<void> {
        // init store with empty string
        Store.instance.testStore.put(StoreMap.getStoreIdentifier(context.config.storeName), '');

        const consumer = await this.startConsuming(context);
        consumer.start().catch((error) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            throw Error(error?.message || error);
        });
    }

    /**
     *
     */
    async execute(context: RabbitListenerContext): Promise<void> {
        StepReport.instance.type = 'rabbitListener';
        const handlerConfig = { ...context.config, passwort: undefined };

        StepReport.instance.addInputItem('Rabbit listening (config)', 'object', handlerConfig);

        await this.bindQueue(context);
        await this.initConsume(context);
    }
}
