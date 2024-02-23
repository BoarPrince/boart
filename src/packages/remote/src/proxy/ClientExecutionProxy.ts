import { RemoteResponse } from './RemoteResponse';
import { RemoteRequest } from './RemoteRequest';

/**
 *
 */
export interface ClientExecutionProxy {
    action: string;
    execute(data: RemoteRequest): RemoteResponse | Promise<RemoteResponse>;
}
