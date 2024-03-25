import event from 'events';
import { RemotePluginRequest } from './RemotePluginRequest';
import { RemotePluginResponse } from './RemotePluginResponse';

/**
 *
 */

export interface PluginEventEmitter extends event.EventEmitter {
    emit(event: 'message', request: RemotePluginRequest): boolean;
    emit(event: 'response', request: RemotePluginResponse): boolean;
    emit(event: 'exit'): boolean;

    on(event: 'message', listener: (request: RemotePluginRequest) => void): this;
    on(event: 'response', listener: (response: RemotePluginResponse) => void): this;
    on(event: 'exit', listener: () => void): this;
}
