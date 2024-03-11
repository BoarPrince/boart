import { PluginRequest } from './PluginRequest';
import { PluginResponse } from './PluginResponse';

/**
 *
 */
export interface ExecutionUnitPlugin {
    action: string;
    execute(request: PluginRequest, response: PluginResponse): void | Promise<void>;
}
