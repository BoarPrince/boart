import { Descriptionable } from '../description/Descriptionable';
import { BaseRowType } from '../table/BaseRowType';
import { ParaType } from '../types/ParaType';
import { ScopedType } from '../types/ScopedType';
import { SelectorType } from '../types/SelectorType';
import { RowValidator } from '../validators/RowValidator';

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
    readonly key: symbol;

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
    readonly scopedType?: ScopedType;

    /**
     *
     */
    readonly validators?: ReadonlyArray<RowValidator>;
}
