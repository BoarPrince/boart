import { NodeForkResponse } from './NodeForkResponse';
import { ClientExecutionProxy } from '../proxy/ClientExecutionProxy';
import { NodeForkRequest } from './NodeForkRequest';

/**
 *
 */
export class NodeForkClient {
    private started = false;
    private clientImplList = new Map<string, ClientExecutionProxy>();

    /**
     *
     */
    constructor(private mainClientExecutionProxy?: ClientExecutionProxy) {}

    /**
     *
     */
    public addClientExecutionProxy(clientExecutionProxy: ClientExecutionProxy) {
        if (this.clientImplList.has(clientExecutionProxy.action)) {
            throw new Error(`client action ${clientExecutionProxy.action} already exists`);
        }
        this.clientImplList.set(clientExecutionProxy.action, clientExecutionProxy);
    }

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
            void this.execute(request) //
                .then((response) => process.send(response));
        });

        /**
         *
         */
        process.on('uncaughtException', (error) => {
            process.send({ id: 'uncaughtException', error: error.message || error });
        });
    }

    /**
     *
     */
    private async execute(request: NodeForkRequest): Promise<NodeForkResponse> {
        const response: NodeForkResponse = {
            id: request.id,
            data: undefined,
            error: undefined
        };

        const client = !request.action?.name ? this.mainClientExecutionProxy : this.clientImplList.get(request.action.name);
        if (!client) {
            response.error = `client '${request.action?.name || 'mainClient'}' not found`;
            return response;
        }

        try {
            response.data = await client.execute(request.message);
        } catch (error) {
            response.error = (error as { message: string }).message || (error as unknown);
        }
        return response;
    }
}
