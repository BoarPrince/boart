import { ExecutionUnit, ParaType } from '@boart/core';
import { StepReport } from '@boart/protocol';

import { AnyContext } from '../../AnyContext';
import { RowTypeValue } from '../../RowTypeValue';

/**
 * | action    |value        |
 * |-----------|-------------|
 * | link:name | http://xxxx |
 */
export class LinkExecutionUnit implements ExecutionUnit<AnyContext, RowTypeValue<AnyContext>> {
    readonly description = {
        id: 'a3a32499-1aad-458c-97ac-badbebf4107b',
        title: 'link',
        description: null,
        examples: null
    };
    readonly priority = 100;
    readonly parameterType = ParaType.True;

    /**
     *
     */
    execute(_: AnyContext, row: RowTypeValue<AnyContext>): void {
        StepReport.instance.addLink(row.actionPara, row.value.toString());
    }
}