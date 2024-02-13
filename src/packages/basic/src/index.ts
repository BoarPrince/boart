import { Runtime, TableHandlerInstances } from '@boart/core';
import { LocalReport, ProtocolGenerator, StepReport, TestReport } from '@boart/protocol';
import core_impl_initialize from '@boart/core-impl';
import remote_server_initialize from '@boart/remote-server';

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
export function basicInitialize(): void {
    if (globalThis.basicInitialized) {
        // call initialize only once a time
        return;
    } else {
        globalThis.basicInitialized = true;
    }

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

    TableHandlerInstances.instance.add(new RestCallTableHandler().handler);

    core_impl_initialize();
    remote_server_initialize();
}

/**
 *
 */
basicInitialize();
