import { ExecutionUnitPlugin } from '../plugin/ExecutionUnitPlugin';
import { PluginRequest } from '../plugin/PluginRequest';
import { PluginResponse } from '../plugin/PluginResponse';
import { DescriptionCollectorHandler } from './DescriptionCollectorHandler';

/**
 *
 */
export class DescriptionCollectorPluginExecutionUnit implements ExecutionUnitPlugin {
    public static readonly name = '#description#';
    public action = DescriptionCollectorPluginExecutionUnit.name;

    /**
     *
     */
    execute(request: PluginRequest): PluginResponse {
        request.context.execution.data = DescriptionCollectorHandler.instance.getDescriptionCollectors();
        return null;
    }
}
