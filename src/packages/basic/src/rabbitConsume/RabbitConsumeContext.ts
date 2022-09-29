import { DataContent, ExecutionContext } from '@boart/core';
import { DataExecutionContext } from '@boart/core-impl';

/**
 *
 */
export interface RabbitConsumeDataExecutionContext extends DataExecutionContext {
    filter: {
        data: DataContent | null;
        header: DataContent | null;
    };
}

/**
 *
 */
export interface RabbitConsumeConfigContext {
    queue: string;
    timeout: number;
    count_min: number;
    count_max: number;
    username: string;
    password: string;
    hostname: string;
    port: number;
    vhost: string;
}

/**
 *
 */
export type RabbitConsumeContext = ExecutionContext<RabbitConsumeConfigContext, null, RabbitConsumeDataExecutionContext>;
