import { RuntimeStartUp } from '../configuration/schema/RuntimeStartUp';
import { DefaultContext } from '../default/DefaultExecutionContext';
import { DefaultRowType } from '../default/DefaultRowType';
import { ExecutionUnit } from '../execution/ExecutionUnit';
import { ExecutionProxyFactory } from './ExecutionProxyFactory';

/**
 *
 */
class StarterProxyFactory implements ExecutionProxyFactory {
    private started = false;

    /**
     *
     */
    constructor(private origin: ExecutionProxyFactory) {}

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
        this.started = true;
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
            }
            return originExecuteMethod(context, row);
        };

        return originExecutionUnit;
    }
}

/**
 *
 */
export class ExecutionProxyFactoryHandler {
    private factories = new Map<string, StarterProxyFactory>();

    /**
     *
     */
    private constructor() {}

    /**
     *
     */
    public static get instance(): ExecutionProxyFactoryHandler {
        if (!globalThis._executionProxyFactoryHandler) {
            const instance = new ExecutionProxyFactoryHandler();
            globalThis._executionProxyFactoryHandler = instance;
        }
        return globalThis._executionProxyFactoryHandler;
    }

    /**
     *
     */
    public addFactory(name: string, factory: ExecutionProxyFactory) {
        if (this.factories.has(name)) {
            throw new Error(`remote factory '${name}' already exists`);
        }

        this.factories.set(name, new StarterProxyFactory(factory));
    }

    /**
     *
     */
    public getFactory(name: string): ExecutionProxyFactory {
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
