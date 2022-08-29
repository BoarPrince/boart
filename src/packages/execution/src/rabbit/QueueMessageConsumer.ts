import { Observable } from 'rxjs';

import { QueueMessage } from './QueueMessage';

/**
 *
 */
export interface QueueMessageConsumer {
    start: () => Promise<void>;
    messages: Observable<QueueMessage>;
    stop: (error?: string) => Promise<void>;
}
