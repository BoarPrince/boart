import { RemoteFactory } from './RemoteFactory';

/**
 *
 */
export class RemoteFactoryHandler {
    private factories = new Map<string, RemoteFactory>();

    /**
     *
     */
    private constructor() {}

    /**
     *
     */
    public static get instance(): RemoteFactoryHandler {
        if (!globalThis._remoteFacotoryHandler) {
            const instance = new RemoteFactoryHandler();
            globalThis._remoteFacotoryHandler = instance;
        }
        return globalThis._remoteFacotoryHandler;
    }

    /**
     *
     */
    public addFactory(runtimeType: string, factory: RemoteFactory) {
        if (this.factories.has(runtimeType)) {
            throw new Error(`remote factory '${runtimeType}' already exists`);
        }

        this.factories.set(runtimeType, factory);
    }

    /**
     *
     */
    public getFactory(runtimeType: string): RemoteFactory {
        if (!this.factories.has(runtimeType)) {
            throw new Error(`remote factory '${runtimeType}' does not exist`);
        }
        return this.factories.get(runtimeType);
    }

    /**
     *
     */
    public keys(): Array<string> {
        return Array.from(this.factories.keys());
    }
}
