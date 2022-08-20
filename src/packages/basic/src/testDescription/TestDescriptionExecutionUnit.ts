import { ExecutionUnit } from '@boart/core';
import { RowTypeValue, TestReport } from '@boart/core-impl';

import { TestDescriptionContext } from './TestDescriptionContext';

/**
 *
 */
export class TestDescriptionExecutionUnit implements ExecutionUnit<TestDescriptionContext, RowTypeValue<TestDescriptionContext>> {
    public description = 'test description';

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(context: TestDescriptionContext, _row: RowTypeValue<TestDescriptionContext>): void {
        TestReport.instance.setDescription(context.config.description);
        TestReport.instance.setFailureDescription(context.config.failureDescription);
        TestReport.instance.setTicket(context.config.ticket);
        TestReport.instance.setPriority(context.config.priority);
    }
}
