import { NodeForkRequest } from './NodeForkRequest';
import { PluginClientDefault, RemotePluginResponse } from '@boart/core';

/**
 *
 */
export class NodeForkPluginClient extends PluginClientDefault {
    /**
     *
     */
    constructor() {
        super(() => this.initialize());
    }

    /**
     *
     */
    private initialize(): Promise<void> {
        /**
         *
         */
        this.emitter.on('response', (response: RemotePluginResponse) => {
            process.send(response);
        });

        /**
         *
         */
        process.on('message', (request: NodeForkRequest) => {
            this.emitter.emit('message', request);
        });

        /**
         *
         */
        process.on('uncaughtException', (error) => {
            process.send({ id: 'uncaughtException', error: error.message || error });
        });

        /**
         *
         */
        process.on('exit', () => {
            this.emitter.emit('exit');
        });

        /**
         *
         */
        this.emitter.on('exit', () => {
            process.exit();
        });

        return Promise.resolve();
    }
}
