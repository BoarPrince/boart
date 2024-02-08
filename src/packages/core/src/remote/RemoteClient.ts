import { RemoteResponse } from './node-fork/NodeForkDataResponse';
import { RemoteRequest } from './RemoteRequest';

/**
 *
 */
export interface RemoteClient {
    execute(data: RemoteRequest): RemoteResponse;
}
