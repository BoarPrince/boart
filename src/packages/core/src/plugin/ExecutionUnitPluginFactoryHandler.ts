import { RuntimeStartUp } from '../configuration/schema/RuntimeStartUp';
import { ExecutionUnitPlugin } from '../plugin/ExecutionUnitPlugin';
import { PluginRequest } from '../plugin/PluginRequest';
import { PluginResponse } from '../plugin/PluginResponse';
import { ExecutionUnitPluginFactory } from './ExecutionUnitPluginFactory';

/**
 *
 */
class StarterProxyFactory implements ExecutionUnitPluginFactory {
    private started = false;

    /**
     *
     */
    public get isLocal(): boolean {
        return this.origin.isLocal;
    }

    /**
     *
     */
    constructor(private origin: ExecutionUnitPluginFactory) {}

    /**
     *
     */
    init(name: string, config: object, runtimeStartup: RuntimeStartUp): void {
        this.origin.init(name, config, runtimeStartup);
    }

    /**
     *
     */
    validate(basePath?: string): void {
        this.origin.validate(basePath);
    }

    /**
     *
     */
    async start(): Promise<void> {
        await this.origin.start();
        this.started = true;
    }

    /**
     * keep care that start is called only once a time before the first execute is called.
     */
    createExecutionUnit(): ExecutionUnitPlugin {
        const originExecutionUnit = this.origin.createExecutionUnit();
        const originExecuteMethod = originExecutionUnit.execute.bind(originExecutionUnit) as (
            request: PluginRequest
        ) => PluginResponse | Promise<PluginResponse>;

        originExecutionUnit.execute = async (request): Promise<PluginResponse> => {
            if (!this.started) {
                await this.start();
            }
            return originExecuteMethod(request);
        };

        return originExecutionUnit;
    }
}

/**
 *
 */
export class ExecutionUnitPluginFactoryHandler {
    private factories = new Map<string, StarterProxyFactory>();

    /**
     *
     */
    private constructor() {}

    /**
     *
     */
    public static get instance(): ExecutionUnitPluginFactoryHandler {
        if (!globalThis._executionPluginFactoryHandler) {
            const instance = new ExecutionUnitPluginFactoryHandler();
            globalThis._executionPluginFactoryHandler = instance;
        }
        return globalThis._executionPluginFactoryHandler;
    }

    /**
     *
     */
    public addFactory(name: string, factory: ExecutionUnitPluginFactory) {
        if (this.factories.has(name)) {
            throw new Error(`remote factory '${name}' already exists`);
        }

        this.factories.set(name, new StarterProxyFactory(factory));
    }

    /**
     *
     */
    public getFactory(name: string): ExecutionUnitPluginFactory {
        if (!this.factories.has(name)) {
            throw new Error(`Remote proxy '${name}' does not exist. Available: '${this.keys().join(', ')}'`);
        }
        return this.factories.get(name);
    }

    /**
     *
     */
    public keys(): Array<string> {
        return Array.from(this.factories.keys());
    }

    /**
     *
     */
    public clear(): void {
        return this.factories.clear();
    }
}
