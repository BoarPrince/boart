import { NodeForkResponse } from './NodeForkResponse';
import { NodeForkRequest } from './NodeForkRequest';
import { ExecutionUnitPluginHandler } from '@boart/core';

/**
 *
 */
export class NodeForkClient {
    private started = false;
    public readonly pluginHandler = new ExecutionUnitPluginHandler();

    /**
     *
     */
    constructor() {}

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
            data: {
                execution: {
                    data: {},
                    header: {}
                },
                reportItems: []
            },
            error: undefined
        };

        try {
            await this.pluginHandler.execute(request.data, response.data);
        } catch (error) {
            response.data = undefined;
            response.error = (error as { message: string }).message || (error as unknown);
        }
        return response;
    }
}
