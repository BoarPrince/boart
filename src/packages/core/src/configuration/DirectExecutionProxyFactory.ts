import { DefaultContext } from '../default/DefaultExecutionContext';
import { DefaultRowType } from '../default/DefaultRowType';
import { ExecutionUnit } from '../execution/ExecutionUnit';
import { ExecutionProxyFactory } from '../execution-proxy/ExecutionProxyFactory';
import { RuntimeStartUp } from './schema/RuntimeStartUp';

/**
 *
 */
export class DirectExecutionProxyFactory implements ExecutionProxyFactory {
    private executionUnit: () => ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>>;
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
    public init(
        _: string,
        executionUnit: () => ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>>,
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
        return this.executionUnit();
    }
}
