import { RemoteRequest } from '../RemoteRequest';
import { NodeForkResponse } from './NodeForkResponse';
import { RemoteClient } from '../RemoteClient';

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
        process.on('message', (request: RemoteRequest) => {
            try {
                const data = this.clientImpl.execute(request);
                process.send({ data } as NodeForkResponse);
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                process.send({ error: error.message || error } as NodeForkResponse);
            }
        });

        process.on('uncaughtException', (error) => {
            process.send({ error: error.message || error });
        });
    }
}
