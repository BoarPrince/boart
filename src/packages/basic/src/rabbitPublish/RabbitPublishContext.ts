import { DataContent, ExecutionContext, ObjectContent } from '@boart/core';

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
    payload: DataContent;
    header: ObjectContent;
    correlationId: string;
    messageId: string;
    routingKey: string;
}

/**
 *
 */
export type RabbitPublishContext = ExecutionContext<RabbitPublishConfigContext, RabbitPublishPreExecutionContext, null>;
