import { ContentType } from '@boart/core';

/**
 *
 */
export interface RabbitQueueMessage {
    message: string;
    correlationId?: string;
    fields?: Record<string, ContentType>;
    properties?: Record<string, ContentType>;
    headers?: Record<string, ContentType>;
    receivedTime?: number;
}
