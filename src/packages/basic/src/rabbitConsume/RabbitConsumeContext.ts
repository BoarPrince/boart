import { DataContent, DefaultExecutionContext, ExecutionContext } from '@boart/core';

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
export interface RabbitConsumeDataExecutionContext extends DefaultExecutionContext {
    filter: {
        data: DataContent | null;
        header: DataContent | null;
    };
}

/**
 *
 */
export type RabbitConsumeContext = ExecutionContext<RabbitConsumeConfigContext, null, RabbitConsumeDataExecutionContext>;
