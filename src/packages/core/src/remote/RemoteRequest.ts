/**
 *
 */

export interface RemoteRequest {
    config: object;
    preExecution: {
        payload: object | number | string | null;
    };
}
