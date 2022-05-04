import { ExecutionContext } from '../../execution/ExecutionContext';
import { BaseRowMetaDefinition } from '../BaseRowMetaDefinition';
import { BaseRowType } from '../BaseRowType';

/**
 *
 */
export interface TypedGroupValidator<
    TExecutionContext extends ExecutionContext<object, object, object>,
    TRowType extends BaseRowType<TExecutionContext>
> {
    readonly name: string;
     
    validate(rows: ReadonlyArray<BaseRowMetaDefinition<TExecutionContext, TRowType>>);
}

/**
 *
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GroupValidator = TypedGroupValidator<any, any>;
