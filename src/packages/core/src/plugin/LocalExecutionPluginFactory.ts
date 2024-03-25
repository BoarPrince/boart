import { RuntimeStartUp } from '../configuration/schema/RuntimeStartUp';
import { ObjectValidator } from '../validators/object/ObjectValidator';
import { ExecutionUnitPlugin } from './ExecutionUnitPlugin';
import { ExecutionUnitPluginFactory } from './ExecutionUnitPluginFactory';
import { LocalPluginHost } from './LocalPluginHost';
import { PluginHostDefault } from './PluginHostDefault';

/**
 *
 */
interface Configuration {
    collectorName: string;
}

/**
 *
 */
export class LocalExecutionPluginFactory implements ExecutionUnitPluginFactory {
    private host: PluginHostDefault;
    private name: string;
    private config: Configuration;
    private runtimeStartup: RuntimeStartUp;

    /**
     *
     */
    public validate(): void {
        if (this.runtimeStartup && this.runtimeStartup !== RuntimeStartUp.ONCE) {
            throw new Error(`local execution plugin allows only runtime startup 'once'`);
        }

        ObjectValidator.instance(this.config) //
            .notNull()
            .onlyContainsProperties(['collectorName'])
            .prop('collectorName')
            .shouldString();
    }

    /**
     *
     */
    public init(name: string, config: Configuration, runtimeStartup: RuntimeStartUp): void {
        this.name = name;
        this.config = config;
        this.runtimeStartup = runtimeStartup;
    }

    /**
     *
     */
    public start(): Promise<void> {
        this.host = new LocalPluginHost(this.name, this.config.collectorName);
        return this.host.init();
    }

    /**
     *
     */
    public createExecutionUnit(): ExecutionUnitPlugin {
        if (this.host == null) {
            throw new Error(`local plugin must be started before creating an execution unit`);
        }
        return this.host;
    }
}
