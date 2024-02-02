import { DefaultRowType, ExecutionUnit, ParaType } from '@boart/core';
// import { StepReport } from '@boart/protocol';

import { AnyContext } from '../../AnyContext';

/**
 * | action    |value        |
 * |-----------|-------------|
 * | link:name | http://xxxx |
 */
export class LinkExecutionUnit implements ExecutionUnit<AnyContext, DefaultRowType<AnyContext>> {
    readonly key = Symbol('link');
    readonly description = () => ({
        id: 'a3a32499-1aad-458c-97ac-badbebf4107b',
        description: null,
        examples: null
    });
    readonly priority = 100;
    readonly parameterType = ParaType.True;

    /**
     *
     */
    execute(_: AnyContext, row: DefaultRowType<AnyContext>): void {
        // StepReport.instance.addLink(row.ast.qualifier?.stringValue, row.value.toString());
    }
}
