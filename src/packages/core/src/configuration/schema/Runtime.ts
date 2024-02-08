import { RuntimeStartUp } from './RuntimeStartUp';

/**
 *
 */

export interface Runtime {
    type: string;
    startup: RuntimeStartUp;
    configuration: object;
}
