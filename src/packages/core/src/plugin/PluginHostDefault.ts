import { randomUUID } from 'crypto';
import { ExecutionUnitPlugin } from './ExecutionUnitPlugin';
import { PluginRequest } from './PluginRequest';
import { PluginResponse } from './PluginResponse';
import { RemotePluginResponse } from './RemotePluginResponse';
import { RemotePluginRequest } from './RemotePluginRequest';
import { PluginEventEmitter } from './PluginEventEmitter';

/**
 *
 */
export abstract class PluginHostDefault implements ExecutionUnitPlugin {
    protected abstract readonly clientEmitter: PluginEventEmitter;
    private static readonly responseEventName = 'response';

    /**
     *
     */
    constructor(public readonly action: string) {}

    /**
     *
     */
    public abstract start(): Promise<void>;

    /**
     *
     */
    public abstract stop(): Promise<void>;

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

                this.clientEmitter.removeListener(PluginHostDefault.responseEventName, msgListener);

                if (msgFromClient.error) {
                    reject(msgFromClient.error);
                } else {
                    request.context.execution = msgFromClient.data.context?.execution;
                    resolve(msgFromClient.data);
                }
            };

            this.clientEmitter.on(PluginHostDefault.responseEventName, msgListener);

            if (this.clientEmitter.send) {
                this.clientEmitter.send({ id, data: request } as RemotePluginRequest);
            } else {
                this.clientEmitter.emit('message', { id, data: request } as RemotePluginRequest);
            }
        });
    }
}
