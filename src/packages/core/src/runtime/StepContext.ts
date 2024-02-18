import { BaseRuntimeContext } from './BaseRuntimeContext';
import { RuntimeResultContext } from './RuntimeResultContext';

/**
 *
 */

export class StepContext extends BaseRuntimeContext implements RuntimeResultContext {
    descriptions = new Array<string>();
    group: string;
    reputations = 0;
}
