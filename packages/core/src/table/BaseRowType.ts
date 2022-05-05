import { ExecutionContext } from '../execution/ExecutionContext';

import { BaseRowMetaDefinition } from './BaseRowMetaDefinition';

/**
 *
 */
export class BaseRowType<TExecutionContext extends ExecutionContext<object, object, object>> {
    constructor(readonly data: BaseRowMetaDefinition<TExecutionContext, BaseRowType<TExecutionContext>>) {}
}

/**
 *
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class AnyBaseRowType extends BaseRowType<any> {}
