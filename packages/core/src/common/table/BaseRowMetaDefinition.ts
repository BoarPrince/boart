import { ExecutionContext } from '../execution/ExecutionContext';

import { BaseRowType } from './BaseRowType';
import { RowDefinition } from './RowDefinition';

/**
 *
 */
export interface BaseRowMetaDefinition<
    TExecutionContext extends ExecutionContext<object, object, object>,
    TRowType extends BaseRowType<TExecutionContext>
> {
    readonly key: string;
    readonly keyPara: string;
    readonly values: Record<string, string | number | boolean>;
    readonly values_replaced: Record<string, string | number | boolean>;
    readonly _metaDefinition: RowDefinition<TExecutionContext, TRowType>;
}
