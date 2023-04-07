import { BaseRuntimeContext } from './BaseRuntimeContext';
import { RuntimeResultContext } from './RuntimeContext';
import { RuntimePriority } from './RuntimePriority';
import { StepContext } from './StepContext';

/**
 *
 */

export class TestContext extends BaseRuntimeContext implements RuntimeResultContext {
    priority: RuntimePriority;
    stepContext = new Array<StepContext>();
}
