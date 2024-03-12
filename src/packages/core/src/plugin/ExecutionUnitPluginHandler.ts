import { ExecutionUnitPlugin } from './ExecutionUnitPlugin';
import { PluginRequest } from './PluginRequest';
import { PluginResponse } from './PluginResponse';

/**
 *
 */
export class ExecutionUnitPluginHandler implements ExecutionUnitPlugin {
    private clientImplList = new Map<string, () => ExecutionUnitPlugin>();
    private mainExecutionPlugin: () => ExecutionUnitPlugin;
    public readonly action: string;

    /**
     *
     */
    public setMainExecutionUnit(mainExecutionPlugin: () => ExecutionUnitPlugin) {
        if (this.mainExecutionPlugin) {
            throw new Error('main execution unit is already defined');
        }
        this.mainExecutionPlugin = mainExecutionPlugin;
    }

    /**
     *
     */
    public addExecutionUnit(name: string, clientExecutionPlugin: () => ExecutionUnitPlugin) {
        if (this.clientImplList.has(name)) {
            throw new Error(`client action ${name} already exists`);
        }
        this.clientImplList.set(name, clientExecutionPlugin);
    }

    /**
     *
     */
    public execute(request: PluginRequest): PluginResponse | Promise<PluginResponse> {
        const executionUnit = !request?.action.name ? this.mainExecutionPlugin : this.clientImplList.get(request.action.name);
        if (!executionUnit) {
            throw new Error(`client '${request.action.name || '-mainClient-'}' not found`);
        }

        return executionUnit().execute(request);
    }
}
