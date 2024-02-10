import { RuntimeStartUp } from '../configuration/schema/RuntimeStartUp';
import { DefaultContext } from '../default/DefaultExecutionContext';
import { DefaultRowType } from '../default/DefaultRowType';
import { ExecutionUnit } from '../execution/ExecutionUnit';

/**
 *
 */
export interface RemoteFactory {
    /**
     * is called once a time during the configuration
     */
    init(name: string, config: object, runtimeStartup: RuntimeStartUp): void;

    /**
     * is called once a time during the configuration and after init.
     *
     * The init parameter (config) can be validated
     */
    validate(): void;

    /***
     * is called only once a time before the first execution unit is requrested.
     *
     * Any startup sequences can be called.
     */
    start();

    /**
     * is called each time the executionUnit is used
     */
    readonly executionUnit: ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>>;
}
