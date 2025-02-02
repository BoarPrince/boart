import { LocalReport, Runtime, StepReport, TableHandlerInstances, TestReport } from '@boart/core';
import { ProtocolGenerator } from '@boart/protocol';
import remote_server_initialize from '@boart/plugin-host';
import core_impl_initialize from '@boart/core-impl';

import DataTableHandler from './data/DataTableHandler';
import RabbitBindTableHandler from './rabbitBind/RabbitBindTableHandler';
import RabbitConsumeTableHandler from './rabbitConsume/RabbitConsumeTableHandler';
import RabbitListenerTableHandler from './rabbitListener/RabbitListenerTableHandler';
import RabbitPublishTableHandler from './rabbitPublish/RabbitPublishTableHandler';
import RestAuthorizeTableHandler from './restAuthorize/RestAuthorizeTableHandler';
import RestCallTableHandler from './restCall/RestCallTableHandler';
import SQLQueryTableHandler from './sqlQuery/SQLQueryTableHandler';
import TestDescriptionTableHandler from './testDescription/TestDescriptionTableHandler';

/**
 *
 */
export function initialized(): void {
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

    core_impl_initialize();
    remote_server_initialize();

    TableHandlerInstances.instance.add(new RestCallTableHandler().handler, 'Rest call');
    TableHandlerInstances.instance.add(new RestAuthorizeTableHandler().handler, 'Rest authorize');
    TableHandlerInstances.instance.add(new RabbitBindTableHandler().handler, 'RabbitMQ bind');
    TableHandlerInstances.instance.add(new RabbitPublishTableHandler().handler, 'RabbitMQ publish');
    TableHandlerInstances.instance.add(new RabbitConsumeTableHandler().handler, 'RabbitMQ consume');
    TableHandlerInstances.instance.add(new RabbitListenerTableHandler().handler, 'RabbitMQ listening');
    TableHandlerInstances.instance.add(new SQLQueryTableHandler().handler, 'SQL query');
    TableHandlerInstances.instance.add(new DataTableHandler().handler, 'Data manage');
    TableHandlerInstances.instance.add(new TestDescriptionTableHandler().handler, 'Test description');
}

/**
 *
 */
// eslint-disable-next-line jest/require-hook
(() => initialized())();
