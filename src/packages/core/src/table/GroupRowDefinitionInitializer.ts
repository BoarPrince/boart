import { ExecutionContext } from '../execution/ExecutionContext';
import { ExecutionUnit } from '../execution/ExecutionUnit';

import { BaseRowType } from './BaseRowType';
import { GroupRowDefinition } from './GroupRowDefinition';
import { RowDefinition } from './RowDefinition';
import { TableRowType } from './TableRowType';

/**
 *
 */
export function GroupRowDefinitionInitializer<
    TExecutionContext extends ExecutionContext<object, object, object>,
    TRowType extends BaseRowType<TExecutionContext>
>(groupName: string, type: TableRowType) {
    /**
     *
     */
    return function<T extends { new (): ExecutionUnit<TExecutionContext, TRowType> }>(constructor: T) {
        const executionUnit = new constructor();

        const rowDefinition = new RowDefinition<TExecutionContext, TRowType>({
            type,
            executionUnit,
            validators: null
        });
        GroupRowDefinition.getInstance<TExecutionContext, TRowType>(groupName).addRowDefinition(rowDefinition);
    };
}
