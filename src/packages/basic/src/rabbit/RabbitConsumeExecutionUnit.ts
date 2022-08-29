import { DataContent, ExecutionUnit, ObjectContent } from '@boart/core';
import { RowTypeValue } from '@boart/core-impl';
import { QueueMessage, QueueMessageConsumer, RabbitQueueHandler } from '@boart/execution';
import { StepReport } from '@boart/protocol';

import { RabbitConsumeContext } from './RabbitConsumeContext';

/**
 *
 */
export class RabbitConsumeExecutionUnit implements ExecutionUnit<RabbitConsumeContext, RowTypeValue<RabbitConsumeContext>> {
    public description = 'rabbit message queue - main';

    /**
     *
     */
    private static createHeader(queueMessage: QueueMessage): ObjectContent {
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
    private static setOrPushData(contextData: DataContent, data: ObjectContent): DataContent {
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
            return new ObjectContent([value, data.getValue()]);
        }
    }

    /**
     *
     */
    private async startConsuming(context: RabbitConsumeContext, runInProcessing: () => Promise<void>): Promise<QueueMessageConsumer> {
        const consumer = await RabbitQueueHandler.instance.consume(context.config.name);
        const reveivedDataList = [];
        StepReport.instance.addResultItem('Rabbit consume (received message)', 'object', reveivedDataList);

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        consumer.messages.subscribe(async (queueMessage: QueueMessage) => {
            const receivedData = {
                header: RabbitConsumeExecutionUnit.createHeader(queueMessage),
                data: new ObjectContent(queueMessage.message)
            };
            reveivedDataList.push(receivedData);

            context.execution.filter.header = receivedData.header;
            context.execution.filter.data = receivedData.data;

            await runInProcessing();

            context.execution.header = RabbitConsumeExecutionUnit.setOrPushData(
                context.execution.header,
                RabbitConsumeExecutionUnit.createHeader(queueMessage)
            );
            context.execution.data = RabbitConsumeExecutionUnit.setOrPushData(
                context.execution.data,
                new ObjectContent(queueMessage.message)
            );

            if (--context.config.messageCount === 0) {
                // consuming can only be stopped if the message count fits
                await consumer.stop();
            }
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
            timeoutHandler = setTimeout(() => void consumer.stop('consumer timed out'), context.config.timeout);
            await consumer.start();
        } catch (error) {
            throw error.message || error;
        } finally {
            clearTimeout(timeoutHandler);
            StepReport.instance.addResultItem('Rabbit consume (header)', 'json', context.execution.header);
            StepReport.instance.addResultItem('Rabbit consume (paylaod)', 'json', context.execution.data);
        }
        //#endregion
    }
}
