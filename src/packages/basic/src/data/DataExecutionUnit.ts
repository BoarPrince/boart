import { ExecutionUnit } from '@boart/core';
import { DataContext, RowTypeValue } from '@boart/core-impl';
import { StepReport } from '@boart/protocol';

/**
 *
 */
export class DataExecutionUnit implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    public description = 'rest call - main';

    /**
     *
     */
    execute(context: DataContext): void {
        StepReport.instance.type = 'data handling';
        StepReport.instance.addInputItem('Data Handling (input)', 'json', context.preExecution.payload);

        context.execution.data = context.preExecution.payload;
    }
}
