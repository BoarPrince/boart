import { RemoteResponse } from './NodeForkDataResponse';

/**
 *
 */
export interface NodeForkResponse {
    error: Error;
    data: RemoteResponse;
}
