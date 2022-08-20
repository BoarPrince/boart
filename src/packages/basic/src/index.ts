import { Runtime, ValueReplacerHandler } from '@boart/core';
import { StepReport, StoreReplacer, TestReport } from '@boart/core-impl';

import BasicDataGroupDefinition from './basicGroup/BasicDataGroupDefinition';
import BasicGroupDefinition from './basicGroup/BasicGroupDefinition';
import RestCallTableHandler from './rest/RestCallTableHandler';
import TestDescriptionTableHandler from './testDescription/TestDescriptionTableHandler';

export { BasicDataGroupDefinition, BasicGroupDefinition, RestCallTableHandler, TestDescriptionTableHandler };

/**
 *
 */
function initialize(): void {
    Runtime.instance.stepRuntime.onEnd().subscribe(() => StepReport.instance.report());
    Runtime.instance.testRuntime.onEnd().subscribe(() => TestReport.instance.report());

    ValueReplacerHandler.instance.add('store', new StoreReplacer());
}

initialize();
