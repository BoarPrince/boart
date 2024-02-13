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
    public addFactory(name: string, factory: RemoteFactory) {
        if (this.factories.has(name)) {
            throw new Error(`remote factory '${name}' already exists`);
        }

        this.factories.set(name, factory);
    }

    /**
     *
     */
    public getFactory(name: string): RemoteFactory {
        if (!this.factories.has(name)) {
            throw new Error(`remote factory '${name}' does not exist`);
        }
        return this.factories.get(name);
    }

    /**
     *
     */
    public keys(): Array<string> {
        return Array.from(this.factories.keys());
    }
}
