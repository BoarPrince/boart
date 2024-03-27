import { ExecutionUnitPlugin } from '@boart/core/lib/plugin/ExecutionUnitPlugin';
import { NodeForkHost } from './NodeForkHost';
import { ExecutionUnitPluginFactory, ObjectValidator, RuntimeStartUp } from '@boart/core';

/**
 *
 */
interface Configuration {
    path: string;
}

/**
 *
 */
export class NodeForkHostProxyFactory implements ExecutionUnitPluginFactory {
    isLocal?: boolean;
    private server: NodeForkHost;
    private name: string;
    private config: Configuration;
    private runtimeStartup: RuntimeStartUp;

    /**
     *
     */
    public validate(): void {
        if (this.runtimeStartup && this.runtimeStartup !== RuntimeStartUp.ONCE) {
            throw new Error(`node fork allows only runtime startup 'once'`);
        }

        ObjectValidator.instance(this.config) //
            .notNull()
            .onlyContainsProperties(['path'])
            .prop('path')
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
        this.server = new NodeForkHost(this.name, this.config.path);
        return Promise.resolve();
    }

    /**
     *
     */
    stop(): Promise<void> {
        return this.server.stop();
    }

    /**
     *
     */
    public createExecutionUnit(): Promise<ExecutionUnitPlugin> {
        if (this.server == null) {
            throw new Error(`node fork must be started before creating an execution unit`);
        }
        return Promise.resolve(this.server);
    }
}
