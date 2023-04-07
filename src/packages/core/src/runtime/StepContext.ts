import { BaseRuntimeContext } from './BaseRuntimeContext';
import { RuntimeResultContext } from './RuntimeContext';

/**
 *
 */

export class StepContext extends BaseRuntimeContext implements RuntimeResultContext {
    descriptions = new Array<string>();
    group: string;
    reputations = 0;
}
