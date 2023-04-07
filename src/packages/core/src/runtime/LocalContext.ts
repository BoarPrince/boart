import { TestContext } from './TestContext';
import { RuntimeResultContext } from './RuntimeContext';
import { BaseRuntimeContext } from './BaseRuntimeContext';

/**
 *
 */

export class LocalContext extends BaseRuntimeContext implements RuntimeResultContext {
    testContext = new Array<TestContext>();
}
