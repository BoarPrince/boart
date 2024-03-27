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
    private _lazyPluginExecutionUnit: ExecutionUnitPlugin;

    /**
     *
     */
    constructor(
        public readonly key: symbol,
        private factory: ExecutionUnitPluginFactory
    ) {}

    /**
     * lazy load execution unit
     */
    private async getPluginExecutionUnit(): Promise<ExecutionUnitPlugin> {
        if (!this._lazyPluginExecutionUnit) {
            this._lazyPluginExecutionUnit = await this.factory.createExecutionUnit();
        }

        return this._lazyPluginExecutionUnit;
    }

    /**
     *
     */
    async execute(context: DefaultContext, row: DefaultRowType<DefaultContext>): Promise<void> {
        const request: PluginRequest = {
            context: JSON.parse(JSON.stringify(context)) as DefaultContext,
            value: row?.value,
            additionalValue: row?.additionalValue,
            action: {
                name: row?.ast.match, //
                ast: row?.ast
            }
        };

        const executionUnit = await this.getPluginExecutionUnit();
        const response = await executionUnit.execute(request);
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
