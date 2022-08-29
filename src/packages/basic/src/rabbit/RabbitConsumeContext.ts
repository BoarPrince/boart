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
    name: string;
    timeout: number;
    messageCount: number;
}

/**
 *
 */
export type RabbitConsumeContext = ExecutionContext<RabbitConsumeConfigContext, null, RabbitConsumeDataExecutionContext>;
