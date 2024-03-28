import event from 'events';
import { ReadonlyDefaultContext } from '../default/DefaultExecutionContext';
import { RemotePluginRequest } from './RemotePluginRequest';
import { RemotePluginResponse } from './RemotePluginResponse';
import { PluginExecutionCollector } from './PluginExecutionCollector';
import { PluginClient } from './PluginClient';
import { PluginEventEmitter } from './PluginEventEmitter';

/**
 *
 */
export class PluginClientDefault implements PluginClient {
    public readonly emitter: PluginEventEmitter = new event.EventEmitter();
    public context: ReadonlyDefaultContext;

    private collector: PluginExecutionCollector;
    private started = false;
    private initializer: () => Promise<void>;

    /**
     *
     */
    constructor(initializer?: () => Promise<void>) {
        this.initializer = initializer;
    }

    /**
     *
     */
    public async start(collector: PluginExecutionCollector): Promise<void> {
        if (this.started) {
            return;
        }

        await collector.start();
        this.collector = collector;
        this.started = true;

        /**
         *
         */
        this.emitter.on('message', (request: RemotePluginRequest) => {
            void this.execute(request) //
                .then((response) => this.emitter.emit('response', response))
                .catch((error) =>
                    this.emitter.emit('response', {
                        id: request.id,
                        error: error,
                        data: undefined
                    })
                );
        });

        /**
         *
         */
        this.emitter.on('stop', () => {
            void this.collector.stop();
        });

        return !this.initializer ? Promise.resolve() : this.initializer();
    }

    /**
     *
     */
    private async execute(request: RemotePluginRequest): Promise<RemotePluginResponse> {
        const response: RemotePluginResponse = {
            id: request.id,
            data: {
                context: undefined,
                reportItems: []
            },
            error: undefined
        };

        const result = await this.collector.pluginHandler.execute(request.data);
        response.data.reportItems = result?.reportItems ?? [];
        response.data.context = request.data.context;
        this.context = request.data.context;

        return response;
    }
}
