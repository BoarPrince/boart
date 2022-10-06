import { ExecutionUnit, Runtime } from '@boart/core';
import { RowTypeValue } from '@boart/core-impl';
import { RabbitQueueHandler } from '@boart/execution';
import { StepReport } from '@boart/protocol';

import { RabbitBindContext } from './RabbitBindContext';

/**
 *
 */
export class RabbitBindExecutionUnit implements ExecutionUnit<RabbitBindContext, RowTypeValue<RabbitBindContext>> {
    public description = 'rabbit queue binding';

    /**
     *
     */
    async execute(context: RabbitBindContext): Promise<void> {
        //#region start consuming
        StepReport.instance.type = 'rabbitBind';
        const handlerConfig = { ...context.config, passwort: undefined };
        StepReport.instance.addResultItem('Rabbit bind (config)', 'object', handlerConfig);

        const handlerInstance = RabbitQueueHandler.getInstance(context.config);
        if (context.config.queue_create) {
            await handlerInstance.addQueue(context.config.queue);
        }

        if (!context.config.routing || !context.config.routing.length) {
            await handlerInstance.bindQueue(context.config.queue, context.config.exchange, '');
        } else {
            for (const routing of context.config.routing) {
                await handlerInstance.bindQueue(context.config.queue, context.config.exchange, routing);
            }
        }

        if (context.config.queue_delete) {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const subscription = Runtime.instance.testRuntime.onEnd().subscribe(async (_) => {
                await handlerInstance.deleteQueue(context.config.queue);
                subscription.unsubscribe();
            });
        }
    }
}
