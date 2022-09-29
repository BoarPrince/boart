import { RabbitQueueMessage } from './RabbitQueueMessage';

/**
 *
 */
export interface RabbitQueueMessageConsumer {
    start: () => Promise<void>;
    messageHandler: (message: RabbitQueueMessage) => Promise<void>;
    stop: (error?: string) => Promise<void>;
}
