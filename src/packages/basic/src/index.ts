import { Runtime, ValueReplacerHandler } from '@boart/core';
import { StepReport, StoreReplacer } from '@boart/core-impl';

import BasicDataGroupDefinition from './basicGroup/BasicDataGroupDefinition';
import BasicGroupDefinition from './basicGroup/BasicGroupDefinition';
import RestCallTableHandler from './rest/RestCallTableHandler';

export { BasicDataGroupDefinition, BasicGroupDefinition, RestCallTableHandler };

/**
 *
 */
function initialize(): void {
    Runtime.instance.stepRuntime.onEnd().subscribe(() => StepReport.instance.report());
    ValueReplacerHandler.instance.add('store', new StoreReplacer());
}

initialize();
