import { NodeForkResponse } from './NodeForkResponse';
import { NodeForkRequest } from './NodeForkRequest';
import { ExecutionUnitPluginHandler, ReadonlyDefaultContext } from '@boart/core';

/**
 *
 */
export class NodeForkClient {
    private started = false;
    public readonly pluginHandler = new ExecutionUnitPluginHandler();
    public context: ReadonlyDefaultContext;

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
                context: undefined,
                reportItems: []
            },
            error: undefined
        };

        try {
            const result = await this.pluginHandler.execute(request.data);
            response.data.reportItems = result?.reportItems ?? [];
            response.data.context = request.data.context;
            this.context = request.data.context;
        } catch (error) {
            response.data = undefined;
            response.error = (error as { message: string }).message || (error as unknown);
        }
        return response;
    }
}
