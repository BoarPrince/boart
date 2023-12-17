import { ASTAction, BaseRowType, ExecutionContext, key, value } from '@boart/core';

/**
 *
 */
export class RowTypeValue<TExecutionContext extends ExecutionContext<object, object, object>> extends BaseRowType<TExecutionContext> {
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
}
