import { DataContent, DataContentHelper, ExecutionUnit, ObjectContent } from '@boart/core';
import { RowTypeValue } from '@boart/core-impl';
import { RabbitQueueHandler, RabbitQueueMessage, RabbitQueueMessageConsumer } from '@boart/execution';
import { StepReport } from '@boart/protocol';

import { RabbitConsumeContext } from './RabbitConsumeContext';

/**
 *
 */
export class RabbitConsumeExecutionUnit implements ExecutionUnit<RabbitConsumeContext, RowTypeValue<RabbitConsumeContext>> {
    public description = 'rabbit message queue - main';

    private receivedMessage = 0;

    /**
     *
     */
    private static createHeader(queueMessage: RabbitQueueMessage): ObjectContent {
        return new ObjectContent({
            correlationId: queueMessage.correlationId,
            fields: queueMessage.fields,
            properties: queueMessage.properties,
            headers: queueMessage.headers
        });
    }

    /**
     *
     */
    private static setOrPushData(contextData: DataContent, data: DataContent): DataContent {
        const value = contextData?.getValue();
        if (!value) {
            // context data is empty
            return data;
        } else if (Array.isArray(value)) {
            // context data is already an array
            value.push(data.getValue());
            return contextData;
        } else {
            // context must be converted to an array
            return DataContentHelper.create([value, data.getValue()]);
        }
    }

    /**
     *
     */
    private async startConsuming(context: RabbitConsumeContext, runInProcessing: () => Promise<void>): Promise<RabbitQueueMessageConsumer> {
        const handlerInstance = RabbitQueueHandler.getInstance(context.config);
        const consumer = await handlerInstance.consume(context.config.name);

        const reveivedDataList = [];
        StepReport.instance.addResultItem('Rabbit consume (received message)', 'object', reveivedDataList);

        /**
         *
         * @param queueMessage message from rabbit queue
         */
        const messageConsumer = async (queueMessage: RabbitQueueMessage) => {
            const receivedData = {
                header: RabbitConsumeExecutionUnit.createHeader(queueMessage),
                data: DataContentHelper.create(queueMessage.message)
            };
            reveivedDataList.push(receivedData);

            context.execution.filter.header = receivedData.header;
            context.execution.filter.data = receivedData.data;

            try {
                await runInProcessing();
            } catch {
                // filter does not match
                return;
            }

            context.execution.header = RabbitConsumeExecutionUnit.setOrPushData(
                context.execution.header,
                RabbitConsumeExecutionUnit.createHeader(queueMessage)
            );
            context.execution.data = RabbitConsumeExecutionUnit.setOrPushData(
                context.execution.data,
                DataContentHelper.create(queueMessage.message)
            );

            if (++this.receivedMessage >= context.config.messageCount) {
                // consuming can only be stopped if the message count fits
                await consumer.stop();
            }
        };

        consumer.messages.subscribe((queueMessage: RabbitQueueMessage) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            messageConsumer(queueMessage).catch((error) => consumer.stop(error?.message || error));
        });
        return consumer;
    }

    /**
     *
     */
    async execute(context: RabbitConsumeContext, _row: RowTypeValue<RabbitConsumeContext>, executor: () => Promise<void>): Promise<void> {
        //#region start consuming
        StepReport.instance.type = 'rabbitConsume';

        StepReport.instance.addInputItem('Rabbit consume (configuration)', 'json', JSON.stringify(context.config));

        let timeoutHandler: NodeJS.Timeout;
        try {
            const consumer = await this.startConsuming(context, executor);
            timeoutHandler = setTimeout(
                () =>
                    void consumer.stop(
                        `consumer timed out after ${context.config.timeout} seconds, ${context.config.messageCount} message(s) expected, ${this.receivedMessage} message(s) received`
                    ),
                context.config.timeout * 1000
            );
            await consumer.start();
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            throw Error(error?.message || error);
        } finally {
            clearTimeout(timeoutHandler);
            StepReport.instance.addResultItem('Rabbit consume (header)', 'json', context.execution.header);
            StepReport.instance.addResultItem('Rabbit consume (paylaod)', 'json', context.execution.data);
        }
        //#endregion
    }
}
