import { BaseRowType } from '../table/BaseRowType';
import { ParaType } from '../table/ParaType';
import { RowValidator } from '../Validators/RowValidator';

import { ExecutionContext } from './ExecutionContext';

/**
 *
 */
export interface ExecutionUnit<
    TExecutionContext extends ExecutionContext<object, object, object>,
    TRowType extends BaseRowType<TExecutionContext>
> {
    /**
     *
     */
    execute(context: TExecutionContext, row: TRowType): void;

    /**
     *
     */
    readonly description: string;

    /**
     *
     */
    readonly parameterType?: ParaType;

    /**
     *
     */
    readonly validators?: ReadonlyArray<RowValidator>;
}
