import { RowValidator } from '../Validators/RowValidator';
import { Descriptionable } from '../description/Descriptionable';
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
> extends Descriptionable {
    /**
     *
     */
    execute(context: TExecutionContext, row?: TRowType, inProcessing?: () => Promise<void>): void | Promise<void>;

    /**
     *
     */
    readonly priority?: number;

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
