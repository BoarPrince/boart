import { RuntimeStartUp } from '../configuration/schema/RuntimeStartUp';
import { DefaultContext } from '../default/DefaultExecutionContext';
import { DefaultRowType } from '../default/DefaultRowType';
import { ExecutionUnit } from '../execution/ExecutionUnit';
import { RemoteFactory } from './RemoteFactory';

/**
 *
 */
class RemoteFactoryProxy implements RemoteFactory {
    private started = false;

    /**
     *
     */
    constructor(private origin: RemoteFactory) {}

    /**
     *
     */
    init(name: string, config: object, runtimeStartup: RuntimeStartUp): void {
        this.origin.init(name, config, runtimeStartup);
    }

    /**
     *
     */
    validate(basePath?: string): void {
        this.origin.validate(basePath);
    }

    /**
     *
     */
    start(): void {
        this.origin.start();
    }

    /**
     * keep care that start is called only once a time before the first execute is called.
     */
    createExecutionUnit(): ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>> {
        const originExecutionUnit = this.origin.createExecutionUnit();
        const originExecuteMethod = originExecutionUnit.execute.bind(originExecutionUnit) as (
            context: unknown,
            row?: unknown
        ) => void | Promise<void>;

        originExecutionUnit.execute = (context, row) => {
            if (!this.started) {
                this.start();
                this.started = true;
            }
            return originExecuteMethod(context, row);
        };

        return originExecutionUnit;
    }
}

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

        this.factories.set(name, new RemoteFactoryProxy(factory));
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
