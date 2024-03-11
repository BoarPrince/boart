import { DataContentHelper } from '../data/DataContentHelper';
import { DefaultContext } from '../default/DefaultExecutionContext';
import { DefaultRowType } from '../default/DefaultRowType';
import { ExecutionUnitPluginFactory } from './ExecutionUnitPluginFactory';
import { ExecutionUnit } from '../execution/ExecutionUnit';
import { StepReport } from '../report/StepReport';
import { ExecutionUnitPlugin } from './ExecutionUnitPlugin';
import { PluginRequest } from './PluginRequest';
import { PluginResponse } from './PluginResponse';

/**
 *
 */
export class ExecutionUnitPluginAdapter implements ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>> {
    private executionUnit: ExecutionUnitPlugin;
    /**
     *
     */
    constructor(
        public readonly key: symbol,
        factory: ExecutionUnitPluginFactory
    ) {
        this.executionUnit = factory.createExecutionUnit();
    }

    /**
     *
     */
    async execute(context: DefaultContext, row: DefaultRowType<DefaultContext>): Promise<void> {
        const request: PluginRequest = {
            context: JSON.parse(JSON.stringify(context)) as DefaultContext,
            action: {
                name: row?.action, //
                ast: row?.ast
            }
        };
        const response: PluginResponse = {
            execution: {
                data: request.context.execution.data,
                header: request.context.execution.header
            },
            reportItems: []
        };
        await this.executionUnit.execute(request, response);

        context.execution.data = DataContentHelper.create(response?.execution.data);
        context.execution.header = DataContentHelper.create(response?.execution.header);

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
