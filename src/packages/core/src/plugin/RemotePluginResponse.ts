import { DefaultContext } from '../default/DefaultExecutionContext';
import { PluginResponse } from './PluginResponse';

/**
 *
 */
export interface RemotePluginResponse {
    id: string;
    error: unknown;
    data: PluginResponse & { context: DefaultContext };
}
