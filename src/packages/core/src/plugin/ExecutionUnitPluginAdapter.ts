import { DefaultContext } from '../default/DefaultExecutionContext';
import { DefaultRowType } from '../default/DefaultRowType';
import { ExecutionUnitPluginFactory } from './ExecutionUnitPluginFactory';
import { ExecutionUnit } from '../execution/ExecutionUnit';
import { StepReport } from '../report/StepReport';
import { ExecutionUnitPlugin } from './ExecutionUnitPlugin';
import { PluginRequest } from './PluginRequest';

/**
 *
 */
export class ExecutionUnitPluginAdapter implements ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>> {
    private pluginExecutionUnit: ExecutionUnitPlugin;
    /**
     *
     */
    constructor(
        public readonly key: symbol,
        factory: ExecutionUnitPluginFactory
    ) {
        this.pluginExecutionUnit = factory.createExecutionUnit();
    }

    /**
     *
     */
    async execute(context: DefaultContext, row: DefaultRowType<DefaultContext>): Promise<void> {
        const request: PluginRequest = {
            context: JSON.parse(JSON.stringify(context)) as DefaultContext,
            value: row?.value,
            action: {
                name: row?.ast.match, //
                ast: row?.ast
            }
        };

        const response = await this.pluginExecutionUnit.execute(request);
        context.execution = request.context.execution;

        StepReport.instance.type = row?.action || this.key.description;
        for (const report of response?.reportItems || []) {
            if (report.type === 'input') {
                StepReport.instance.addInputItem(report.description, report.dataType, report.data);
            } else {
                StepReport.instance.addResultItem(report.description, report.dataType, report.data);
            }
        }
    }
}
