import { DefaultContext } from '../default/DefaultExecutionContext';
import { DefaultRowType } from '../default/DefaultRowType';
import { ExecutionUnit } from '../execution/ExecutionUnit';
import { RemoteFactory } from '../remote/RemoteFactory';
import { RuntimeStartUp } from './schema/RuntimeStartUp';

/**
 *
 */
export class DirectExecutionUnitProxyFactory implements RemoteFactory {
    private config: ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>>;
    private runtimeStartup: RuntimeStartUp;

    /**
     *
     */
    public validate(): void {
        if (this.runtimeStartup && this.runtimeStartup !== RuntimeStartUp.EACH) {
            throw new Error(`direct execution unit prosy only allows runtime startup 'each'`);
        }

        if (
            !Object.hasOwn(this.config, 'execute') && //
            !Object.hasOwn(this.config, 'key')
        ) {
            throw new Error(`config must be an execition unit`);
        }
    }

    /**
     *
     */
    public init(_: string, config: ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>>, runtimeStartup: RuntimeStartUp): void {
        this.config = config;
        this.runtimeStartup = runtimeStartup;
    }

    /**
     *
     */
    public start() {
        // there is no explicit start needed
    }

    /**
     *
     */
    public get executionUnit(): ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>> {
        return this.config;
    }
}
