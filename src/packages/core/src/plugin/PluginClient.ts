import EventEmitter from 'events';
import { ReadonlyDefaultContext } from '../default/DefaultExecutionContext';
import { PluginExecutionCollector } from './PluginExecutionCollector';

/**
 *
 */

export interface PluginClient {
    /**
     *
     */
    readonly context: ReadonlyDefaultContext;

    /**
     *
     */
    readonly emitter: EventEmitter;

    /**
     *
     */
    start(collector: PluginExecutionCollector): Promise<void>;
}
