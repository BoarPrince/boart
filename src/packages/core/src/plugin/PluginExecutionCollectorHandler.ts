import { PluginExecutionCollector } from './PluginExecutionCollector';

/**
 *
 */
export class PluginExecutionCollectorHandler {
    private readonly collectorList: Map<string, PluginExecutionCollector>;

    /**
     *
     */
    private constructor() {
        this.collectorList = new Map<string, PluginExecutionCollector>();
    }

    /**
     *
     */
    public static get instance(): PluginExecutionCollectorHandler {
        if (!globalThis._collectorHandlerInstance) {
            globalThis._collectorHandlerInstance = new PluginExecutionCollectorHandler();
        }
        return globalThis._collectorHandlerInstance;
    }

    /**
     *
     */
    public addCollector(name: string, collector: PluginExecutionCollector): void {
        if (this.collectorList.has(name)) {
            throw new Error(`Execution unit collector with name '${name}' already exists`);
        }
        this.collectorList.set(name, collector);
    }

    /**
     *
     */
    public getCollector(name: string): PluginExecutionCollector {
        if (!this.collectorList.has(name)) {
            throw new Error(`Execution unit collector with name '${name}' does not exist`);
        }
        return this.collectorList.get(name);
    }
}
