import { ExecutionUnitPluginFactory } from './ExecutionUnitPluginFactory';
import { RuntimeStartUp } from '../configuration/schema/RuntimeStartUp';
import { ExecutionUnitPlugin } from './ExecutionUnitPlugin';

/**
 *
 */
export class DirectExecutionPluginFactory implements ExecutionUnitPluginFactory {
    public readonly isLocal = true;
    private executionUnit: () => ExecutionUnitPlugin;
    private runtimeStartup: RuntimeStartUp;

    /**
     *
     */
    public validate(): void {
        if (this.runtimeStartup && this.runtimeStartup !== RuntimeStartUp.EACH) {
            throw new Error(`DirectExecutionProxyFactory (direct): Only allows runtime startup 'each'`);
        }

        if (typeof this.executionUnit !== 'function') {
            throw new Error(`DirectExecutionProxyFactory (direct): Config must be a function to create an execution unit`);
        }
    }

    /**
     *
     */
    public init(name: string, executionUnit: () => ExecutionUnitPlugin, runtimeStartup: RuntimeStartUp): void {
        this.executionUnit = executionUnit;
        this.runtimeStartup = runtimeStartup;
    }

    /**
     *
     */
    public start(): Promise<void> {
        // there is no explicit start needed
        return Promise.resolve();
    }

    /**
     *
     */
    stop(): Promise<void> {
        // there is no explicit stop needed
        return Promise.resolve();
    }

    /**
     *
     */
    public createExecutionUnit(): Promise<ExecutionUnitPlugin> {
        return Promise.resolve(this.executionUnit());
    }
}
