import { ExecutionUnitPluginFactoryHandler } from '@boart/core';
import { NodeForkRemoteProxyFactory } from './node-fork/NodeForkRemoteProxyFactory';

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

    ExecutionUnitPluginFactoryHandler.instance.addFactory('node-fork', new NodeForkRemoteProxyFactory());
}
