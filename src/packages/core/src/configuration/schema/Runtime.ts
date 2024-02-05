import { RuntimeEnv } from './RuntimeEnv';
import { RuntimeStartUp } from './RuntimeStartUp';
import { RuntimeType } from './RuntimeType';

/**
 *
 */

export interface Runtime {
    type: RuntimeType;
    env: RuntimeEnv;
    startup: RuntimeStartUp;
    configuration: object;
}
