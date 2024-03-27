import { ExecutionUnitPluginFactory } from './ExecutionUnitPluginFactory';
import { StartStopProxyFactory } from './StartStopProxyFactory';

/**
 *
 */
export class ExecutionUnitPluginFactoryHandler {
    private factories = new Map<string, ExecutionUnitPluginFactory>();

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

        this.factories.set(name, new StartStopProxyFactory(factory));
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
