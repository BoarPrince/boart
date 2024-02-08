import { run } from 'node:test';
import { RuntimeStartUp } from '../../configuration/schema/RuntimeStartUp';
import { DefaultContext } from '../../default/DefaultExecutionContext';
import { DefaultRowType } from '../../default/DefaultRowType';
import { ExecutionUnit } from '../../execution/ExecutionUnit';
import { ObjectValidator } from '../../validators/object/ObjectValidator';
import { RemoteFactory } from '../RemoteFactory';
import { NodeForkExecutionUnit } from './NodeForkExecutionUnit';
import { NodeForkServer } from './NodeForkServer';

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
    init(name: string, config: Configuration, runtimeStartup?: RuntimeStartUp): void {
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
