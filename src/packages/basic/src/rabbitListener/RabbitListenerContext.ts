import { ExecutionContext } from '@boart/core';

/**
 *
 */
export interface RabbitListenerConfigContext {
    queue: string;

    storeName: string;

    exchange: string;
    routing: string[];

    username: string;
    password: string;
    hostname: string;
    port: number;
    vhost: string;
}

/**
 *
 */
export type RabbitListenerContext = ExecutionContext<RabbitListenerConfigContext, null, null>;
