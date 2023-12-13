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
    readonly description = {
        id: 'd4900e8f-7247-41e6-aa45-fe8967ad45c9',
        title: 'wait',
        description: null,
        examples: null
    };
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
        const timeUnit = row.ast.qualifier?.paras?.[0];
        const multiplicator = !timeUnit || timeUnit === 'sec' ? 1000 : 1000 * 60;

        return new Promise((resolve) => {
            setTimeout(() => resolve(), duration * multiplicator);
        });
    }
}
