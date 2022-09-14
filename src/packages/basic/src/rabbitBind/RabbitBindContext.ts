import { ExecutionContext } from '@boart/core';

/**
 *
 */
export interface RabbitBindConfigContext {
    queue: string;
    exchange: string;
    routing: string[];
    queue_create: boolean;
    queue_delete: boolean;
    username: string;
    password: string;
    hostname: string;
    port: number;
    vhost: string;
}

/**
 *
 */
export type RabbitBindContext = ExecutionContext<RabbitBindConfigContext, null, null>;
