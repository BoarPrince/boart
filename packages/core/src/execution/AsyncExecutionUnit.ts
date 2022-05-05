import { BaseRowType } from '../table/BaseRowType';
import { ParaType } from '../table/ParaType';
import { RowValidator } from '../Validators/RowValidator';

import { ExecutionContext } from './ExecutionContext';
import { ExecutionUnit } from './ExecutionUnit';

/**
 *
 */
export interface AsyncExecutionUnit<
    TExecutionContext extends ExecutionContext<object, object, object>,
    TRowType extends BaseRowType<TExecutionContext>
> extends ExecutionUnit<TExecutionContext, TRowType> {
    /**
     *
     */
    execute(context: TExecutionContext, row: TRowType): Promise<void>;

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
