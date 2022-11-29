import { ExecutionUnit, Runtime, RuntimePriority } from '@boart/core';
import { RowTypeValue } from '@boart/core-impl';
import { TestReport } from '@boart/protocol';

import { TestDescriptionContext } from './TestDescriptionContext';

/**
 *
 */
export class TestDescriptionExecutionUnit implements ExecutionUnit<TestDescriptionContext, RowTypeValue<TestDescriptionContext>> {
    public description = {
        id: '62283f19-496c-4fee-9d81-7193d6c10c27',
        title: 'test description',
        description: '',
        examples: null
    };

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(context: TestDescriptionContext, _row: RowTypeValue<TestDescriptionContext>): void {
        TestReport.instance.setDescription(context.config.description);
        TestReport.instance.setFailureDescription(context.config.failureDescription);
        TestReport.instance.setTicket(context.config.ticket);
        Runtime.instance.testRuntime.current.priority = RuntimePriority.priority(context.config.priority);
    }
}
