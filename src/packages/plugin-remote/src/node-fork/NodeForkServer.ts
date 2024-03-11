import { ChildProcess, fork } from 'child_process';
import { randomUUID } from 'crypto';
import { NodeForkRequest, NodeForkResponse } from '@boart/plugin';
import { ExecutionUnitPlugin, PluginRequest, PluginResponse } from '@boart/core';

/**
 *
 */
export class NodeForkServer implements ExecutionUnitPlugin {
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
    execute(request: PluginRequest, response: PluginResponse): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const id: string = randomUUID();

            /**
             *
             */
            const msgListener = (msgFromClient: NodeForkResponse) => {
                if (msgFromClient.id !== 'uncaughtException' && msgFromClient.id !== id) {
                    return;
                }
                this.child.removeListener('message', msgListener);

                if (msgFromClient.error) {
                    reject(msgFromClient.error);
                } else {
                    response.execution = msgFromClient.data.execution;
                    response.reportItems = msgFromClient.data.reportItems;
                    resolve();
                }
            };

            this.child.on('message', msgListener);
            this.child.send({ id, data: request } as NodeForkRequest);
        });
    }
}
