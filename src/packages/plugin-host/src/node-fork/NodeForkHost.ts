import { ChildProcess, fork } from 'child_process';
import { PluginHostDefault } from '@boart/core';
import { PluginEventEmitter } from '@boart/core/lib/plugin/PluginEventEmitter';

/**
 *
 */
export class NodeForkHost extends PluginHostDefault {
    private childProcess: ChildProcess;

    /**
     *
     */
    protected get clientEmitter(): PluginEventEmitter {
        if (!this.childProcess) {
            throw new Error('NodeForkHost: init must be called before requesting the client emitter');
        }
        return this.childProcess;
    }

    /**
     *
     */
    constructor(
        public readonly action: string,
        private readonly path: string
    ) {
        super(action);
    }

    /**
     *
     */
    public start(): Promise<void> {
        this.childProcess = fork(this.path, {
            silent: true
        });

        this.childProcess.on('message', (message) => {
            this.childProcess.send(message);
        });

        this.childProcess.stderr.on('data', (data) => {
            console.error('child:', this.path, data);
        });

        this.childProcess.stdout.on('data', (data) => {
            console.log('child:', this.path, data);
        });

        return;
    }

    /**
     *
     */
    stop(): Promise<void> {
        this.childProcess.kill();
        return;
    }
}
