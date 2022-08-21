import { Runtime, ValueReplacerHandler } from '@boart/core';
import { LocalReport, ProtocolGenerator, Report, StepReport, StoreReplacer, TestReport } from '@boart/core-impl';

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
        Report.instance.report();
        new ProtocolGenerator().generate();
    });

    ValueReplacerHandler.instance.add('store', new StoreReplacer());
}

initialize();
