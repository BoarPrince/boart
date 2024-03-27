import { PluginClientDefault, RemotePluginRequest, RemotePluginResponse } from '@boart/core';

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
        process.on('message', (request: RemotePluginRequest) => {
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
            this.emitter.emit('stop');
        });

        /**
         *
         */
        this.emitter.on('stop', () => {
            process.exit();
        });

        return Promise.resolve();
    }
}
