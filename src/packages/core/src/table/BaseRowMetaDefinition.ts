import { ExecutionContext } from '../execution/ExecutionContext';
import { ASTAction } from '../parser/ast/ASTAction';

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
    readonly ast: ASTAction;
    readonly keyPara?: string;
    readonly selector?: string;
    readonly values_replaced: Record<string, string | number | boolean>;
    readonly _metaDefinition: RowDefinition<TExecutionContext, TRowType>;
}
