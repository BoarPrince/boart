import { DataContentHelper, DefaultContext, DefaultRowType, ExecutionUnit, ParaType, ScopedType, SelectorType } from '@boart/core';
import { NodeForkServer } from './NodeForkServer';
import { RemoteResponse } from '../../../execution-proxy-client/lib';
import { StepReport } from '@boart/protocol';

/**
 *
 */
export class NodeForkExecutionProxyUnit implements ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>> {
    public readonly key: symbol;
    public readonly parameterType = ParaType.False;
    public readonly selectorType = SelectorType.False;
    public readonly scopedType = ScopedType.False;

    /**
     *
     */
    constructor(
        private name: string,
        private server: NodeForkServer
    ) {
        this.key = Symbol(name);
    }

    /**
     *
     */
    async execute(context: DefaultContext, row?: DefaultRowType<DefaultContext>): Promise<void> {
        const response: RemoteResponse = await this.server.execute(
            {
                config: context.config,
                preExecution: context.preExecution
            },
            {
                name: row?.action, //
                ast: row?.ast
            }
        );

        context.execution.data = DataContentHelper.create(response.execution.data);
        context.execution.header = DataContentHelper.create(response.execution.header);

        StepReport.instance.type = this.name;
        for (const report of response.reportItems) {
            if (report.type === 'input') {
                StepReport.instance.addInputItem(report.description, report.dataType, report.data);
            } else {
                StepReport.instance.addResultItem(report.description, report.dataType, report.data);
            }
        }
    }
}
