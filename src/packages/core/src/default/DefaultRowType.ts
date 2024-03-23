import { ExecutionContext } from '../execution/ExecutionContext';
import { ASTAction } from '../parser/ast/ASTAction';
import { BaseRowType } from '../table/BaseRowType';
import { key, value } from '../table/TableRowDecorator';

/**
 *
 */
export class DefaultRowType<TExecutionContext extends ExecutionContext<object, object, object>> extends BaseRowType<TExecutionContext> {
    @key()
    get action(): string {
        return this.data.ast.name.value;
    }

    get ast(): ASTAction {
        return this.data.ast;
    }

    @value()
    get value(): string | number | boolean {
        return this.data.values_replaced['value'];
    }

    @value(false, ['location', 'property'])
    get additionalValue(): string | number | boolean {
        return this.data.values_replaced['location'] || this.data.values_replaced['property'];
    }
}
