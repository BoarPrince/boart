import { ChildProcess, fork } from 'child_process';
import { randomUUID } from 'crypto';
import { NodeForkRequest, NodeForkResponse, RemoteRequest, RemoteResponse } from '@boart/remote';

/**
 *
 */
export class NodeForkServer {
    private readonly child: ChildProcess;

    /**
     *
     */
    constructor(private path: string) {
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
    public execute(message: RemoteRequest): Promise<RemoteResponse> {
        return new Promise((resolve, reject) => {
            const id: string = randomUUID();

            /**
             *
             */
            const msgListener = (msgFromClient: NodeForkResponse) => {
                if (msgFromClient.id !== 'uncaughtException' || msgFromClient.id !== id) {
                    return;
                }
                this.child.removeListener('message', msgListener);
                msgFromClient.error //
                    ? reject(msgFromClient.error)
                    : resolve(msgFromClient.data);
            };

            this.child.on('message', msgListener);
            this.child.send({ message, id } as NodeForkRequest);
        });
    }
}
