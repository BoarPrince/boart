import { RemoteRequest } from '../proxy/RemoteRequest';

/**
 *
 */
export interface NodeForkRequest {
    id: string;
    action?: { name: string; ast: object };
    message: RemoteRequest;
}
