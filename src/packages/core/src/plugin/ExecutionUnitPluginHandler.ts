import { DescriptionCollectorPluginExecutionUnit } from '../description/DescriptionCollectorPluginExecutionUnit';
import { ExecutionUnitPlugin } from './ExecutionUnitPlugin';
import { PluginRequest } from './PluginRequest';
import { PluginResponse } from './PluginResponse';

/**
 *
 */
type MainExecutionUnitType = Omit<ExecutionUnitPlugin, 'action'>;

/**
 *
 */
export class ExecutionUnitPluginHandler implements ExecutionUnitPlugin {
    private pluginList: Map<string, () => ExecutionUnitPlugin | Promise<ExecutionUnitPlugin>>;
    private mainExecutionPlugin: () => MainExecutionUnitType;
    public readonly action: string;

    /**
     *
     */
    constructor() {
        this.pluginList = new Map<string, () => ExecutionUnitPlugin>();

        // add default execution unit
        this.addExecutionUnit(DescriptionCollectorPluginExecutionUnit.name, () => new DescriptionCollectorPluginExecutionUnit());
    }

    /**
     *
     */
    public setMainExecutionUnit(mainExecutionPlugin: () => MainExecutionUnitType);
    public setMainExecutionUnit(mainExecutionPlugin: MainExecutionUnitType);
    public setMainExecutionUnit(mainExecutionPlugin: (() => MainExecutionUnitType) | MainExecutionUnitType) {
        if (this.mainExecutionPlugin) {
            throw new Error('main execution unit is already defined');
        }

        if (typeof mainExecutionPlugin === 'function') {
            this.mainExecutionPlugin = mainExecutionPlugin;
        } else {
            this.mainExecutionPlugin = () => mainExecutionPlugin;
        }
    }

    /**
     *
     */
    public addExecutionUnit(clientExecutionPlugin: ExecutionUnitPlugin | Promise<ExecutionUnitPlugin>);
    public addExecutionUnit(name: string, clientExecutionPlugin: () => ExecutionUnitPlugin | Promise<ExecutionUnitPlugin>);
    public addExecutionUnit(name: Array<string>, clientExecutionPlugin: () => ExecutionUnitPlugin | Promise<ExecutionUnitPlugin>);
    public async addExecutionUnit(
        nameOrPlugin: string | Array<string> | ExecutionUnitPlugin | Promise<ExecutionUnitPlugin>,
        clientExecutionPluginCreator?: () => ExecutionUnitPlugin | Promise<ExecutionUnitPlugin>
    ) {
        if (typeof nameOrPlugin === 'string') {
            const name = nameOrPlugin;
            this.add(name, clientExecutionPluginCreator);
        } else if (Array.isArray(nameOrPlugin)) {
            for (const name of nameOrPlugin) {
                this.add(name, clientExecutionPluginCreator);
            }
        } else {
            const nameOrNames = (await nameOrPlugin).action;
            clientExecutionPluginCreator = () => nameOrPlugin;
            if (Array.isArray(nameOrNames)) {
                for (const name of nameOrNames) {
                    this.add(name, clientExecutionPluginCreator);
                }
            } else {
                this.add(nameOrNames, clientExecutionPluginCreator);
            }
        }
    }

    /**
     *
     */
    private add(name: string, clientExecutionPluginCreator: () => ExecutionUnitPlugin | Promise<ExecutionUnitPlugin>): void {
        if (this.pluginList.has(name)) {
            throw new Error(`client action '${name}' already exists`);
        }
        this.pluginList.set(name, clientExecutionPluginCreator);
    }

    /**
     *
     */
    public async execute(request: PluginRequest): Promise<PluginResponse> {
        const executionUnitCreator = !request?.action.name
            ? this.mainExecutionPlugin
            : this.pluginList.get(request.action.ast.name.stringValue);
        if (!executionUnitCreator) {
            throw new Error(
                `execution unit plugin not found: '${request.action.name || '-mainClient-'}'\nonly available: ${Array.from(
                    this.pluginList.keys()
                ).join(', ')}`
            );
        }

        const executionUnit = await executionUnitCreator();
        return executionUnit.execute(request);
    }
}
