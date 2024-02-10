import { NodeForkResponse } from './NodeForkResponse';
import { RemoteClient } from '../proxy/RemoteClient';
import { NodeForkRequest } from './NodeForkRequest';

/**
 *
 */
export class NodeForkClient {
    private started = false;

    /**
     *
     */
    constructor(private clientImpl: RemoteClient) {}

    /**
     *
     */
    public start() {
        if (this.started) {
            return;
        }
        this.started = true;

        /**
         *
         */
        process.on('message', (request: NodeForkRequest) => {
            const response: NodeForkResponse = {
                id: request.id,
                data: undefined,
                error: undefined
            };

            try {
                response.data = this.clientImpl.execute(request.message);
            } catch (error) {
                response.error = (error as { message: string }).message || (error as unknown);
            }
            process.send(response);
        });

        process.on('uncaughtException', (error) => {
            process.send({ id: 'uncaughtException', error: error.message || error });
        });
    }
}
