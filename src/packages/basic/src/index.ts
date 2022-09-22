import { GeneratorHandler, Runtime, ValueReplacerHandler } from '@boart/core';
import {
    CharGenerator,
    DateTimeGenerator,
    EnvironmentReplacer,
    FakeGenerator,
    GenerateReplacer,
    HexGenerator,
    IbanGenerator,
    ISODateGenerator,
    RandomGenerator,
    ReferenceReplacer,
    StoreReplacer,
    TextReplacer,
    TimestampGenerator,
    UUIDGenerator
} from '@boart/core-impl';
import { LocalReport, ProtocolGenerator, StepReport, TestReport } from '@boart/protocol';

import BasicDataGroupDefinition from './basicGroup/BasicDataGroupDefinition';
import BasicGroupDefinition from './basicGroup/BasicGroupDefinition';
import DataTableHandler from './data/DataTableHandler';
import RabbitBindTableHandler from './rabbitBind/RabbitBindTableHandler';
import RabbitConsumeTableHandler from './rabbitConsume/RabbitConsumeTableHandler';
import RabbitPublishTableHandler from './rabbitPublish/RabbitPublishTableHandler';
import RestAuthorizeTableHandler from './restAuthorize/RestAuthorizeTableHandler';
import RestCallTableHandler from './restCall/RestCallTableHandler';
import TestDescriptionTableHandler from './testDescription/TestDescriptionTableHandler';

export {
    BasicDataGroupDefinition,
    BasicGroupDefinition,
    RabbitConsumeTableHandler,
    RabbitBindTableHandler,
    RabbitPublishTableHandler,
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

    GeneratorHandler.instance.addItems([
        new CharGenerator(),
        new DateTimeGenerator(),
        new FakeGenerator(),
        new HexGenerator(),
        new IbanGenerator(),
        new ISODateGenerator(),
        new RandomGenerator(),
        new TimestampGenerator(),
        new UUIDGenerator()
    ]);
}

initialize();
