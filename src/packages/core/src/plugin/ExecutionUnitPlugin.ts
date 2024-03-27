import { PluginRequest } from './PluginRequest';
import { PluginResponse } from './PluginResponse';

/**
 *
 */
export interface ExecutionUnitPlugin {
    action: string | Array<string>;
    execute(request: PluginRequest): PluginResponse | Promise<PluginResponse>;
}
