import { ChildProcess, fork } from 'child_process';
import { randomUUID } from 'crypto';
import { ExecutionUnitPlugin, PluginRequest, PluginResponse, RemotePluginRequest, RemotePluginResponse } from '@boart/core';

/**
 *
 */
export class NodeForkHost implements ExecutionUnitPlugin {
    private readonly child: ChildProcess;

    /**
     *
     */
    constructor(
        public readonly action: string,
        private path: string
    ) {
        this.child = fork(path, {
            silent: true
        });
        this.init();
    }

    /**
     *
     */
    private init() {
        this.child.stderr.on('data', (data) => {
            console.error('child:', this.path, data);
        });

        this.child.stdout.on('data', (data) => {
            console.log('child:', this.path, data);
        });
    }

    /**
     *
     */
    execute(request: PluginRequest): Promise<PluginResponse> {
        return new Promise<PluginResponse>((resolve, reject) => {
            const id: string = randomUUID();

            /**
             *
             */
            const msgListener = (msgFromClient: RemotePluginResponse) => {
                if (msgFromClient.id !== 'uncaughtException' && msgFromClient.id !== id) {
                    return;
                }
                this.child.removeListener('message', msgListener);

                if (msgFromClient.error) {
                    reject(msgFromClient.error);
                } else {
                    request.context.execution = msgFromClient.data.context?.execution;
                    resolve(msgFromClient.data);
                }
            };

            this.child.on('message', msgListener);
            this.child.send({ id, data: request } as RemotePluginRequest);
        });
    }
}
