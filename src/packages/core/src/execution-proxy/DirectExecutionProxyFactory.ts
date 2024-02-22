import { DefaultContext } from '../default/DefaultExecutionContext';
import { DefaultRowType } from '../default/DefaultRowType';
import { ExecutionUnit } from '../execution/ExecutionUnit';
import { ExecutionProxyFactory } from './ExecutionProxyFactory';
import { RuntimeStartUp } from '../configuration/schema/RuntimeStartUp';

/**
 *
 */
export class DirectExecutionProxyFactory implements ExecutionProxyFactory {
    private executionUnit: ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>>;
    private runtimeStartup: RuntimeStartUp;

    /**
     *
     */
    public validate(): void {
        if (this.runtimeStartup && this.runtimeStartup !== RuntimeStartUp.EACH) {
            throw new Error(`direct execution unit prosy only allows runtime startup 'each'`);
        }

        if (
            !Object.hasOwn(this.executionUnit, 'execute') && //
            !Object.hasOwn(this.executionUnit, 'key')
        ) {
            throw new Error(`config must be an execition unit`);
        }
    }

    /**
     *
     */
    public init(
        _: string,
        executionUnit: ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>>,
        runtimeStartup: RuntimeStartUp
    ): void {
        this.executionUnit = executionUnit;
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
    public createExecutionUnit(): ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>> {
        return this.executionUnit;
    }
}
