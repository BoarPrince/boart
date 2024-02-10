import { DataContentHelper, DefaultContext, DefaultRowType, ExecutionUnit, ParaType, ScopedType, SelectorType } from '@boart/core';
import { NodeForkServer } from './NodeForkServer';
import { RemoteResponse } from '@boart/remote';

/**
 *
 */
export class NodeForkExecutionUnit implements ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>> {
    public readonly key: symbol;
    public readonly parameterType = ParaType.False;
    public readonly selectorType = SelectorType.False;
    public readonly scopedType = ScopedType.False;

    /**
     *
     */
    constructor(
        name: string,
        private server: NodeForkServer
    ) {
        this.key = Symbol(name);
    }

    /**
     *
     */
    async execute(context: DefaultContext): Promise<void> {
        const response: RemoteResponse = await this.server.execute({
            config: context.config,
            preExecution: context.preExecution
        });

        context.execution.data = DataContentHelper.create(response.execution.data);
        context.execution.header = DataContentHelper.create(response.execution.header);

        // StepReport.instance.type =
        for (const report of response.reportItems) {
            if (report.type === 'input') {
                // StepReport.instance.
            } else {
                // StepReport.instance.
            }
        }
    }
}
