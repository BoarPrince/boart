import { RemoteResponse } from '../proxy/RemoteResponse';

/**
 *
 */
export interface NodeForkResponse {
    id: string;
    error: unknown;
    data: RemoteResponse;
}
