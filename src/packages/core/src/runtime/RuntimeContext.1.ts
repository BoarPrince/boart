import { EnvLoader } from '../common/EnvLoader';

import { BaseRuntimeContext } from './BaseRuntimeContext';
import { LocalContext } from './LocalContext';
import { RuntimeResultContext } from './RuntimeContext';

/**
 *
 */

export class RuntimeContext extends BaseRuntimeContext implements RuntimeResultContext {
    name = EnvLoader.instance.getProjectName();
    environment = EnvLoader.instance.getEnvironment()?.toString();

    localContext = Array<LocalContext>();
}
