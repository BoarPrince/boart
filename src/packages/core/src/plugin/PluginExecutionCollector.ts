import { ExecutionUnitPluginHandler } from './ExecutionUnitPluginHandler';

/**
 *
 */

export interface PluginExecutionCollector {
    /**
     *
     */
    readonly pluginHandler: ExecutionUnitPluginHandler;

    /**
     *
     */
    start(): Promise<void>;

    /**
     *
     */
    stop(): Promise<void>;
}
