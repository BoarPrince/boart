import { Runtime, ValueReplacerHandler } from '@boart/core';
import { EnvironmentReplacer, GenerateReplacer, ReferenceReplacer, StoreReplacer, TextReplacer } from '@boart/core-impl';
import { LocalReport, ProtocolGenerator, StepReport, TestReport } from '@boart/protocol';

import BasicDataGroupDefinition from './basicGroup/BasicDataGroupDefinition';
import BasicGroupDefinition from './basicGroup/BasicGroupDefinition';
import DataTableHandler from './data/DataTableHandler';
import RabbitConsumeTableHandler from './rabbitConsume/RabbitConsumeTableHandler';
import RestAuthorizeTableHandler from './restAuthorize/RestAuthorizeTableHandler';
import RestCallTableHandler from './restCall/RestCallTableHandler';
import TestDescriptionTableHandler from './testDescription/TestDescriptionTableHandler';

export {
    BasicDataGroupDefinition,
    BasicGroupDefinition,
    RabbitConsumeTableHandler,
    RestAuthorizeTableHandler,
    RestCallTableHandler,
    TestDescriptionTableHandler,
    DataTableHandler
};

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
    ValueReplacerHandler.instance.add('env', new EnvironmentReplacer());
    ValueReplacerHandler.instance.add('text', new TextReplacer());
    ValueReplacerHandler.instance.add('generate', new GenerateReplacer());
    ValueReplacerHandler.instance.add('ref', new ReferenceReplacer());
}

initialize();
