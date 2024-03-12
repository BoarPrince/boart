import { DefaultContext, PluginResponse } from '@boart/core';

/**
 *
 */
export interface NodeForkResponse {
    id: string;
    error: unknown;
    data: PluginResponse & { context: DefaultContext };
}
