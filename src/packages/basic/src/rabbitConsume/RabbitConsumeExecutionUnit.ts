import { DataContent, DataContentHelper, DefaultRowType, ExecutionUnit, ExecutionUnitValidation, ObjectContent } from '@boart/core';
import { RabbitQueueHandler, RabbitQueueMessage, RabbitQueueMessageConsumer } from '@boart/execution';
import { StepReport } from '@boart/protocol';

import { RabbitConsumeContext } from './RabbitConsumeContext';

/**
 *
 */
export class RabbitConsumeExecutionUnit
    implements ExecutionUnit<RabbitConsumeContext, DefaultRowType<RabbitConsumeContext>>, ExecutionUnitValidation<RabbitConsumeContext>
{
    readonly key = Symbol('rabbit message queue - main');
    readonly description = () => ({
        id: '5536aa8e-0441-4580-8b0b-442a072e7a8a',
        description: null,
        examples: null
    });

    private receivedMessage = 0;

    /**
     *
     */
    private static createHeader(queueMessage: RabbitQueueMessage): ObjectContent {
        return new ObjectContent({
            correlationId: queueMessage.correlationId,
            fields: queueMessage.fields,
            properties: queueMessage.properties,
            headers: queueMessage.headers,
            receivedTime: queueMessage.receivedTime
        });
    }

    /**
     *
     */
    private static addData(contextData: DataContent, data: DataContent): DataContent {
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
        const consumer = await handlerInstance.consume(context.config.queue);

        const reveivedDataList = [];
        StepReport.instance.addResultItem('Rabbit consume (received messages)', 'object', reveivedDataList);

        /**
         *
         * @param queueMessage message from rabbit queue
         */
        const messageConsumer = async (queueMessage: RabbitQueueMessage) => {
            const receivedData = {
                header: RabbitConsumeExecutionUnit.createHeader(queueMessage),
                data: DataContentHelper.create(queueMessage.message)
            };
            reveivedDataList.push({
                header: receivedData.header.valueOf(),
                data: receivedData.data.valueOf()
            });

            context.execution.filter.header = receivedData.header;
            context.execution.filter.data = receivedData.data;

            try {
                await runInProcessing();
            } catch {
                // filter does not match
                return;
            }

            context.execution.header = RabbitConsumeExecutionUnit.addData(
                context.execution.header,
                RabbitConsumeExecutionUnit.createHeader({ ...queueMessage, message: undefined })
            );
            context.execution.data = RabbitConsumeExecutionUnit.addData(
                context.execution.data,
                DataContentHelper.create(queueMessage.message)
            );

            ++this.receivedMessage;

            if (context.config.count_max != null) {
                if (this.receivedMessage > context.config.count_max) {
                    // consuming can only be stopped if the message count fits
                    await consumer.stop(
                        `maximum ${context.config.count_max} message(s) expected, but ${this.receivedMessage} message(s) received`
                    );
                }
            } else {
                if (this.receivedMessage >= context.config.count_min) {
                    // consuming can only be stopped if the message count fits
                    await consumer.stop();
                }
            }
        };

        consumer.messageHandler = (queueMessage: RabbitQueueMessage) => messageConsumer(queueMessage);
        return consumer;
    }

    /**
     *
     */
    validate(context: RabbitConsumeContext): void {
        // rule 1: one count must be at least defined
        if (context.config.count_min === 0 && context.config.count_max == null) {
            throw Error(`minimum message count can't be 0 if no maximum count is defined`);
        }
    }

    /**
     *
     */
    async execute(context: RabbitConsumeContext, _row: DefaultRowType<RabbitConsumeContext>, executor: () => Promise<void>): Promise<void> {
        //#region start consuming
        StepReport.instance.type = 'rabbitConsume';

        const handlerConfig = { ...context.config, passwort: undefined };
        StepReport.instance.addInputItem('Rabbit consume (configuration)', 'object', { ...handlerConfig, password: undefined });

        let timeoutHandler: NodeJS.Timeout;
        try {
            const consumer = await this.startConsuming(context, executor);
            timeoutHandler = setTimeout(
                () =>
                    void consumer.stop(
                        this.receivedMessage < context.config.count_min
                            ? `consumer timed out after ${context.config.timeout} seconds, minimum ${context.config.count_min} message(s) expected, ${this.receivedMessage} message(s) received`
                            : undefined
                    ),
                context.config.timeout * 1000
            );
            await consumer.start();
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            throw Error(error?.message || error);
        } finally {
            clearTimeout(timeoutHandler);
            StepReport.instance.addResultItem('Rabbit consume (header)', 'object', context.execution.header);
            StepReport.instance.addResultItem('Rabbit consume (data)', 'object', context.execution.data);
        }
        //#endregion
    }
}
