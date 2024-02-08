import { ChildProcess, fork } from 'child_process';
import { NodeForkResponse } from './NodeForkResponse';
import { RemoteRequest } from '../RemoteRequest';
import { RemoteResponse } from './NodeForkDataResponse';

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
            this.child.once('message', (msgFromClient: NodeForkResponse) => {
                msgFromClient.error //
                    ? reject(msgFromClient.error)
                    : resolve(msgFromClient.data);
            });
            this.child.send(message);
        });
    }
}
