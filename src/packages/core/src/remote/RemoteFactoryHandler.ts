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
        if (!globalThis._remoteFactoryHandler) {
            const instance = new RemoteFactoryHandler();
            globalThis._remoteFactoryHandler = instance;
        }
        return globalThis._remoteFactoryHandler;
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
            throw new Error(`Remote proxy '${name}' does not exist. Available: '${this.keys().join(', ')}'`);
        }
        return this.factories.get(name);
    }

    /**
     *
     */
    public keys(): Array<string> {
        return Array.from(this.factories.keys());
    }

    /**
     *
     */
    public clear(): void {
        return this.factories.clear();
    }
}
