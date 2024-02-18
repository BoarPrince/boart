import { TestContext } from './TestContext';
import { RuntimeResultContext } from './RuntimeResultContext';
import { BaseRuntimeContext } from './BaseRuntimeContext';

/**
 *
 */
export class LocalContext extends BaseRuntimeContext implements RuntimeResultContext {
    testContext = new Array<TestContext>();
}
