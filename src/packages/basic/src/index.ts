import { Runtime, ValueReplacerHandler } from '@boart/core';
import { StoreReplacer } from '@boart/core-impl';
import { LocalReport, ProtocolGenerator, StepReport, TestReport } from '@boart/protocol';

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
    Runtime.instance.localRuntime.onEnd().subscribe(() => LocalReport.instance.report());
    Runtime.instance.runtime.onEnd().subscribe(() => {
        Runtime.instance.save();
        new ProtocolGenerator().generate();
    });

    ValueReplacerHandler.instance.add('store', new StoreReplacer());
}

initialize();
