import { RuntimeStatus } from './RuntimeStatus';

/**
 *
 */
export interface RuntimeResultContext {
    id: string;
    startTime?: string;
    endTime?: string;
    duration?: string;
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
    duration?: string;
    location?: string;
    tags?: Array<string>;
    status = RuntimeStatus.notExecuted;
    stackTrace?: string;
    errorMessage?: string;
}

/**
 *
 */
export class StepContext extends BaseRuntimeContext implements RuntimeResultContext {}

/**
 *
 */
export class TestContext extends BaseRuntimeContext implements RuntimeResultContext {
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
    name: string;
    localContext = Array<LocalContext>();
}
