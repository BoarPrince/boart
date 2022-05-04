import { ExecutionContext } from '../common/execution/ExecutionContext';
import { BaseRowType } from '../common/table/BaseRowType';
import { key, value } from '../common/table/TableRowDecorator';

/**
 *
 */
export class RowTypeValue<TExecutionContext extends ExecutionContext<object, object, object>> extends BaseRowType<TExecutionContext> {
    @key()
    get action() {
        return this.data.key;
    }
    get actionPara() {
        return this.data.keyPara;
    }

    @value()
    get value() {
        return this.data.values_replaced['value'];
    }
}
