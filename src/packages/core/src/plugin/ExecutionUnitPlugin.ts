import { PluginRequest } from './PluginRequest';
import { PluginResponse } from './PluginResponse';

/**
 *
 */
export interface ExecutionUnitPlugin {
    action: string;
    execute(request: PluginRequest): PluginResponse | Promise<PluginResponse>;
}
