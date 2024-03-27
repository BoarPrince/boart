import { PluginHostDefault } from './PluginHostDefault';
import { PluginClientDefault } from './PluginClientDefault';
import { PluginEventEmitter } from './PluginEventEmitter';
import { PluginExecutionCollectorHandler } from './PluginExecutionCollectorHandler';

/**
 *
 */
export class LocalPluginHost extends PluginHostDefault {
    protected clientEmitter: PluginEventEmitter;

    /**
     *
     */
    constructor(
        public readonly action: string,
        private collectorName: string
    ) {
        super(action);
    }

    /**
     *
     */
    public start(): Promise<void> {
        const collector = PluginExecutionCollectorHandler.instance.getCollector(this.collectorName);

        const client = new PluginClientDefault();
        this.clientEmitter = client.emitter;

        return client.start(collector());
    }

    /**
     *
     */
    public stop(): Promise<void> {
        this.clientEmitter.emit('stop');
        return;
    }
}
