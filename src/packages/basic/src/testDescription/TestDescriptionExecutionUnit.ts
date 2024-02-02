import { DefaultRowType, ExecutionUnit, Runtime, RuntimePriority } from '@boart/core';
import { TestReport } from '@boart/protocol';

import { TestDescriptionContext } from './TestDescriptionContext';

/**
 *
 */
export class TestDescriptionExecutionUnit implements ExecutionUnit<TestDescriptionContext, DefaultRowType<TestDescriptionContext>> {
    readonly key = Symbol('test description');
    readonly description = () => ({
        id: 'description:unit',
        description: '',
        examples: null
    });

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(context: TestDescriptionContext, _row: DefaultRowType<TestDescriptionContext>): void {
        TestReport.instance.setDescription(context.config.description);
        TestReport.instance.setFailureDescription(context.config.failureDescription);
        TestReport.instance.setTicket(context.config.ticket);
        Runtime.instance.testRuntime.currentContext.priority = RuntimePriority.priority(context.config.priority);
    }
}
