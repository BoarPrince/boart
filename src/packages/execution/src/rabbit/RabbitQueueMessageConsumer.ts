import { Observable } from 'rxjs';

import { RabbitQueueMessage } from './RabbitQueueMessage';

/**
 *
 */
export interface RabbitQueueMessageConsumer {
    start: () => Promise<void>;
    messages: Observable<RabbitQueueMessage>;
    stop: (error?: string) => Promise<void>;
}
