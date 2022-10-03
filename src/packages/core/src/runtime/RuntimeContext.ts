import { EnvLoader } from '../common/EnvLoader';

import { RuntimePriority } from './RuntimePriority';
import { RuntimeStatus } from './RuntimeStatus';

/**
 *
 */
export interface RuntimeResultContext {
    startTime?: string;
    endTime?: string;
    duration?: number;
    stackTrace?: string;
    errorMessage?: string;
    status: RuntimeStatus;
}

/**
 *
 */
export abstract class BaseRuntimeContext {
    id: string;
    name: string;
    startTime?: string;
    endTime?: string;
    duration?: number;
    location?: string;
    tags?: Array<string>;
    status = RuntimeStatus.notExecuted;
    stackTrace?: string;
    errorMessage?: string;
}

/**
 *
 */
export class StepContext extends BaseRuntimeContext implements RuntimeResultContext {
    descriptions = new Array<string>();
    group: string;
}

/**
 *
 */
export class TestContext extends BaseRuntimeContext implements RuntimeResultContext {
    priority: RuntimePriority;
    stepContext = new Array<StepContext>();
}

/**
 *
 */
export class LocalContext extends BaseRuntimeContext implements RuntimeResultContext {
    testContext = new Array<TestContext>();
}

/**
 *
 */
export class RuntimeContext extends BaseRuntimeContext implements RuntimeResultContext {
    name = EnvLoader.instance.getProjectName();
    environment = EnvLoader.instance.getEnvironment()?.toString();

    localContext = Array<LocalContext>();
}
