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
    get actionPara(): string {
        return this.data.ast.qualifier?.stringValue;
    }
    get selector(): string {
        return this.data.ast.selectors?.match;
    }
    @value()
    get value(): string | number | boolean {
        return this.data.values_replaced['value'];
    }
}
