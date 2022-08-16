import { ExecutionUnit, ParaType } from '@boart/core';

import { AnyContext } from '../../AnyContext';
import { RowTypeValue } from '../../RowTypeValue';
import { IntValidator } from '../../validators/IntValidator';
import { UniqueValidator } from '../../validators/UniqueValidator';

/**
 * |action           |value |
 * |-----------------|------|
 * | wait:before:sec | 20   |
 *
 * |action           |value |
 * |-----------------|------|
 * | wait:before:min | 20   |
 */
export class WaitExecutionUnit implements ExecutionUnit<AnyContext, RowTypeValue<AnyContext>> {
    readonly description = 'wait';
    readonly parameterType = ParaType.Optional;
    readonly validators = [
        new IntValidator('value'), //
        new UniqueValidator()
    ];

    /**
     *
     */
    execute(_: AnyContext, row: RowTypeValue<AnyContext>): Promise<void> {
        const duration = parseInt(row.value.toString());
        const multiplicator = !row.actionPara || row.actionPara === 'sec' ? 1000 : 1000 * 60;

        return new Promise((resolve) => {
            setTimeout(() => resolve(), duration * multiplicator);
        });
    }
}
