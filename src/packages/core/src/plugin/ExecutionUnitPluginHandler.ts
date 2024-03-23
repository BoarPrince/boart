import { DescriptionCollectorPluginExecutionUnit } from '../description/DescriptionCollectorPluginExecutionUnit';
import { ExecutionUnitPlugin } from './ExecutionUnitPlugin';
import { PluginRequest } from './PluginRequest';
import { PluginResponse } from './PluginResponse';

/**
 *
 */
export class ExecutionUnitPluginHandler implements ExecutionUnitPlugin {
    private clientImplList: Map<string, () => ExecutionUnitPlugin>;
    private mainExecutionPlugin: () => ExecutionUnitPlugin;
    public readonly action: string;

    /**
     *
     */
    constructor() {
        this.clientImplList = new Map<string, () => ExecutionUnitPlugin>();

        // add default execution unit
        this.addExecutionUnit(DescriptionCollectorPluginExecutionUnit.name, () => new DescriptionCollectorPluginExecutionUnit());
    }

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
    public addExecutionUnit(clientExecutionPlugin: ExecutionUnitPlugin);
    public addExecutionUnit(name: string, clientExecutionPlugin: () => ExecutionUnitPlugin);
    public addExecutionUnit(nameOrPlugin: string | ExecutionUnitPlugin, clientExecutionPlugin?: () => ExecutionUnitPlugin) {
        let name: string;

        if (typeof nameOrPlugin === 'string') {
            name = nameOrPlugin;
        } else {
            name = nameOrPlugin.action;
            clientExecutionPlugin = () => nameOrPlugin;
        }

        if (this.clientImplList.has(name)) {
            throw new Error(`client action '${name}' already exists`);
        }
        this.clientImplList.set(name, clientExecutionPlugin);
    }

    /**
     *
     */
    public execute(request: PluginRequest): PluginResponse | Promise<PluginResponse> {
        const executionUnit = !request?.action.name ? this.mainExecutionPlugin : this.clientImplList.get(request.action.name);
        if (!executionUnit) {
            throw new Error(`plugin '${request.action.name || '-mainClient-'}' not found`);
        }

        return executionUnit().execute(request);
    }
}
