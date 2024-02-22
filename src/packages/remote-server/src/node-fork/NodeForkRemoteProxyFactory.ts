import { NodeForkExecutionProxyUnit } from './NodeForkExecutionProxyUnit';
import { NodeForkServer } from './NodeForkServer';
import { DefaultContext, DefaultRowType, ExecutionProxyFactory, ExecutionUnit, ObjectValidator, RuntimeStartUp } from '@boart/core';

/**
 *
 */
interface Configuration {
    path: string;
}

/**
 *
 */
export class NodeForkRemoteProxyFactory implements ExecutionProxyFactory {
    private server: NodeForkServer;
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
    public start() {
        this.server = new NodeForkServer(this.config.path);
    }

    /**
     *
     */
    public createExecutionUnit(): ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>> {
        return new NodeForkExecutionProxyUnit(this.name, this.server);
    }
}
