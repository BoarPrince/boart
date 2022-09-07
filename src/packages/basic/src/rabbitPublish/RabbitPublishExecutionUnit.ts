import { ExecutionUnit } from '@boart/core';
import { RowTypeValue } from '@boart/core-impl';
import { RabbitQueueHandler } from '@boart/execution';
import { StepReport } from '@boart/protocol';

import { RabbitPublishContext } from './RabbitPublishContext';
import { PublishType } from './RabbitPublishType';

/**
 *
 */
export class RabbitPublishExecutionUnit implements ExecutionUnit<RabbitPublishContext, RowTypeValue<RabbitPublishContext>> {
    public description = 'rabbit sent message - main';

    /**
     *
     */
    async execute(context: RabbitPublishContext): Promise<void> {
        //#region start consuming
        StepReport.instance.type = 'rabbitPublish';

        const handlerConfig = { ...context.config, passwort: undefined };
        StepReport.instance.addInputItem('Rabbit publish (configuration)', 'object', handlerConfig);

        if (!context.preExecution.header.isObject()) {
            throw Error(`header must key valued, but it's not`);
        }

        const handlerInstance = RabbitQueueHandler.getInstance(context.config);

        const headers = Object.entries(context.preExecution.header.getObject()).reduce((p, c) => {
            p[c[0]] = c[1];
            return p;
        }, {} as Record<string, unknown>);

        if (context.config.type === PublishType.Queue) {
            await handlerInstance.sendToQueue(
                context.config.queue_or_exhange,
                context.preExecution.payload.toJSON(),
                headers,
                context.preExecution.correlationId,
                context.preExecution.messageId
            );
        } else {
            await handlerInstance.sendToExchange(
                context.config.queue_or_exhange,
                context.preExecution.routingKey,
                context.preExecution.payload.toJSON(),
                headers,
                context.preExecution.correlationId,
                context.preExecution.messageId
            );
        }
    }
}
