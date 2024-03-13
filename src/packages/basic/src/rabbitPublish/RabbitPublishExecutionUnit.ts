import { DataContentHelper, DefaultRowType, ExecutionUnit, StepReport } from '@boart/core';
import { RabbitQueueHandler } from '@boart/execution';

import { RabbitPublishContext } from './RabbitPublishContext';
import { PublishType } from './RabbitPublishType';

/**
 *
 */
export class RabbitPublishExecutionUnit implements ExecutionUnit<RabbitPublishContext, DefaultRowType<RabbitPublishContext>> {
    readonly key = Symbol('rabbit sent message - main');
    readonly description = () => ({
        id: 'rabbit:publish:unit',
        description: '',
        examples: null
    });

    /**
     *
     */
    async execute(context: RabbitPublishContext): Promise<void> {
        //#region start consuming
        StepReport.instance.type = 'rabbitPublish';

        const config = { ...context.config, password: undefined };
        StepReport.instance.addInputItem('Rabbit publish (configuration)', 'json', config);

        if (!DataContentHelper.isObject(context.preExecution.header)) {
            throw Error(`header must key valued, but it's not`);
        }

        const handlerInstance = RabbitQueueHandler.getInstance(context.config);
        const headers = context.preExecution.header;

        StepReport.instance.addInputItem('Rabbit publish (header)', 'object', { ...context.preExecution, payload: undefined });

        if (context.config.type === PublishType.Queue) {
            StepReport.instance.addInputItem('Rabbit publish to queue (payload)', 'json', context.preExecution.payload);
            await handlerInstance.sendToQueue(
                context.config.queue_or_exhange,
                JSON.stringify(context.preExecution.payload.valueOf()),
                headers.valueOf() as Record<string, unknown>,
                context.preExecution.correlationId,
                context.preExecution.messageId
            );
        } else {
            StepReport.instance.addInputItem('Rabbit publish to exchange (payload)', 'json', context.preExecution.payload);
            const routings = context.preExecution.routing;
            for (const routing of routings.length === 0 ? [''] : routings) {
                await handlerInstance.sendToExchange(
                    context.config.queue_or_exhange,
                    routing,
                    JSON.stringify(context.preExecution.payload.valueOf()),
                    headers.valueOf() as Record<string, unknown>,
                    context.preExecution.correlationId,
                    context.preExecution.messageId
                );
            }
        }
    }
}
