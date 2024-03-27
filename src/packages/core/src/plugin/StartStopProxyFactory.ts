import { RuntimeStartUp } from '../configuration/schema/RuntimeStartUp';
import { ExecutionUnitPlugin } from '../plugin/ExecutionUnitPlugin';
import { PluginRequest } from '../plugin/PluginRequest';
import { PluginResponse } from '../plugin/PluginResponse';
import { Runtime } from '../runtime/Runtime';
import { ExecutionUnitPluginFactory } from './ExecutionUnitPluginFactory';

/**
 *
 */
export class StartStopProxyFactory implements ExecutionUnitPluginFactory {
    private started = false;

    /**
     *
     */
    public get isLocal(): boolean {
        return this.origin.isLocal;
    }

    /**
     *
     */
    constructor(private origin: ExecutionUnitPluginFactory) {}

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
    async start(): Promise<void> {
        await this.origin.start();
        this.started = true;
    }

    /**
     *
     */
    async stop(): Promise<void> {
        this.started = false;
        await this.origin.stop();
        return;
    }

    /**
     * keep care that start is called only once a time before the first execute is called.
     */
    async createExecutionUnit(): Promise<ExecutionUnitPlugin> {
        if (!this.started) {
            await this.start();

            const subscription = Runtime.instance.runtime.onEnd().subscribe(() => {
                subscription.unsubscribe();
                void this.stop();
            });
        }

        const originExecutionUnit = await this.origin.createExecutionUnit();
        const originExecuteMethod = originExecutionUnit.execute.bind(originExecutionUnit) as (
            request: PluginRequest
        ) => PluginResponse | Promise<PluginResponse>;

        originExecutionUnit.execute = async (request): Promise<PluginResponse> => {
            return originExecuteMethod(request);
        };

        return originExecutionUnit;
    }
}
