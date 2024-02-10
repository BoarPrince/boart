import { RemoteResponse } from './RemoteResponse';
import { RemoteRequest } from './RemoteRequest';

/**
 *
 */
export interface RemoteClient {
    execute(data: RemoteRequest): RemoteResponse;
}
