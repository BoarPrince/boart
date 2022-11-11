import { ExecutionContext } from '@boart/core';

import { PublishType } from './RabbitPublishType';

/**
 *
 */
export interface RabbitPublishConfigContext {
    queue_or_exhange: string;
    type: PublishType;
    username: string;
    password: string;
    hostname: string;
    port: number;
    vhost: string;
}

/**
 *
 */
export interface RabbitPublishPreExecutionContext {
    payload: object;
    header: object;
    correlationId: string;
    messageId: string;
    routing: Array<string>;
}

/**
 *
 */
export type RabbitPublishContext = ExecutionContext<RabbitPublishConfigContext, RabbitPublishPreExecutionContext, null>;
