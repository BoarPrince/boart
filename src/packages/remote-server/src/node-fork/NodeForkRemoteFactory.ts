import { NodeForkExecutionUnit } from './NodeForkExecutionUnit';
import { NodeForkServer } from './NodeForkServer';
import { DefaultContext, DefaultRowType, ExecutionUnit, ObjectValidator, RemoteFactory, RuntimeStartUp } from '@boart/core';

/**
 *
 */
interface Configuration {
    path: string;
}

/**
 *
 */
export class NodeForkRemoteFactory implements RemoteFactory {
    private server: NodeForkServer;
    private name: string;
    private config: Configuration;
    private runtimeStartup: RuntimeStartUp;

    /**
     *
     */
    validate(): void {
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
    init(name: string, config: Configuration, runtimeStartup: RuntimeStartUp): void {
        this.name = name;
        this.config = config;
        this.runtimeStartup = runtimeStartup;
    }

    /**
     *
     */
    start() {
        this.server = new NodeForkServer(this.config.path);
    }

    /**
     *
     */
    get executionUnit(): ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>> {
        return new NodeForkExecutionUnit(this.name, this.server);
    }
}
