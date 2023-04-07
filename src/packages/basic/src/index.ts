import { GeneratorHandler, Runtime, TableHandlerInstances, ValueReplacerHandler } from '@boart/core';
import {
    CharGenerator,
    ContextReplacer,
    DateTimeGenerator,
    EnvironmentReplacer,
    FakeGenerator,
    FileReplacer,
    GenerateReplacer,
    HexGenerator,
    IbanGenerator,
    ISODateGenerator,
    RandomGenerator,
    ReferenceReplacer,
    StoreReplacer,
    TemplateGenerator,
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
import RabbitListenerTableHandler from './rabbitListener/RabbitListenerTableHandler';
import RabbitPublishTableHandler from './rabbitPublish/RabbitPublishTableHandler';
import RestAuthorizeTableHandler from './restAuthorize/RestAuthorizeTableHandler';
import RestCallTableHandler from './restCall/RestCallTableHandler';
import SQLQueryTableHandler from './sqlQuery/SQLQueryTableHandler';
import TestDescriptionTableHandler from './testDescription/TestDescriptionTableHandler';

export {
    BasicDataGroupDefinition,
    BasicGroupDefinition,
    RabbitConsumeTableHandler,
    RabbitBindTableHandler,
    RabbitPublishTableHandler,
    RabbitListenerTableHandler,
    RestAuthorizeTableHandler,
    RestCallTableHandler,
    TestDescriptionTableHandler,
    DataTableHandler,
    SQLQueryTableHandler
};

/**
 *
 */
function initialize(): void {
    Runtime.instance.stepRuntime.onEnd().subscribe(() => StepReport.instance.report());
    Runtime.instance.stepRuntime.onClear().subscribe(() => StepReport.instance.clear());
    Runtime.instance.testRuntime.onEnd().subscribe(() => TestReport.instance.report());
    Runtime.instance.localRuntime.onEnd().subscribe(() => LocalReport.instance.report());
    Runtime.instance.runtime.onStart().subscribe(() => {
        ProtocolGenerator.cleanReportPath();
    });
    Runtime.instance.runtime.onEnd().subscribe(() => {
        Runtime.instance.save();
        new ProtocolGenerator().generate();
    });

    ValueReplacerHandler.instance.add('store', new StoreReplacer());
    ValueReplacerHandler.instance.add('env', new EnvironmentReplacer());
    ValueReplacerHandler.instance.add('text', new TextReplacer());
    ValueReplacerHandler.instance.add('generate', new GenerateReplacer());
    ValueReplacerHandler.instance.add('ref', new ReferenceReplacer());
    ValueReplacerHandler.instance.add('context', new ContextReplacer());
    ValueReplacerHandler.instance.add('file', new FileReplacer());

    TableHandlerInstances.instance.add(new RestCallTableHandler().handler);

    GeneratorHandler.instance.addItems([
        new CharGenerator(),
        new DateTimeGenerator(),
        new FakeGenerator(),
        new TemplateGenerator(),
        new HexGenerator(),
        new IbanGenerator(),
        new ISODateGenerator(),
        new RandomGenerator(),
        new TimestampGenerator(),
        new UUIDGenerator()
    ]);
}

initialize();
