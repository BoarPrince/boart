import { RuntimeStartUp } from '../configuration/schema/RuntimeStartUp';
import { ExecutionUnitPlugin } from './ExecutionUnitPlugin';

/**
 *
 */
export interface ExecutionUnitPluginFactory {
    /**
     *
     */
    readonly isLocal?: boolean;

    /**
     * is called once a time during the configuration
     */
    init(name: string, config: object | (() => ExecutionUnitPlugin), runtimeStartup: RuntimeStartUp): void;

    /**
     * is called once a time during the configuration and after init.
     *
     * The init parameter (config) can be validated
     */
    validate(basePath?: string): void;

    /***
     * is called only once a time before the first execution unit is requrested.
     *
     * Any startup sequences can be called.
     */
    start(): Promise<void>;

    /**
     * is called each time the executionUnit is used
     */
    createExecutionUnit(): ExecutionUnitPlugin;
}
