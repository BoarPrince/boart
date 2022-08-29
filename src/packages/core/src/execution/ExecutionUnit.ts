import { RowValidator } from '../Validators/RowValidator';
import { BaseRowType } from '../table/BaseRowType';
import { ParaType } from '../types/ParaType';
import { SelectorType } from '../types/SelectorType';

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
    execute(context: TExecutionContext, row?: TRowType, inProcessing?: () => Promise<void>): void | Promise<void>;

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
    readonly selectorType?: SelectorType;

    /**
     *
     */
    readonly validators?: ReadonlyArray<RowValidator>;
}
