import { ExecutionUnitPluginFactoryHandler } from '@boart/core';
import { NodeForkHostProxyFactory } from './node-fork/NodeForkHostProxyFactory';

/**
 *
 */
export default function initialize(): void {
    if (globalThis.remoteServerInitialized) {
        // call initialize only once a time
        return;
    } else {
        globalThis.remoteServerInitialized = true;
    }

    ExecutionUnitPluginFactoryHandler.instance.addFactory('node-fork', new NodeForkHostProxyFactory());
}
