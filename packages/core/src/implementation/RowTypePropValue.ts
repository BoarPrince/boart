import { ExecutionContext } from '../common/execution/ExecutionContext';
import { value } from '../common/table/TableRowDecorator';

import { RowTypeValue } from './RowTypeValue';

/**
 *
 */
export class RowTypePropValue<TExecutionContext extends ExecutionContext<object, object, object>> extends RowTypeValue<TExecutionContext> {
    @value()
    readonly property = () => this.data.values_replaced['property'];
}
