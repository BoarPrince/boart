import { BaseRowType, ExecutionContext, key, value } from '@boart/core';

import { ASTAction } from './parser/ast/ASTAction';

/**
 *
 */
export class RowTypeValue<TExecutionContext extends ExecutionContext<object, object, object>> extends BaseRowType<TExecutionContext> {
    @key()
    get action(): string {
        return this.data.key;
    }
    get ast(): ASTAction {
        return this.data.ast;
    }
    get actionPara(): string {
        return this.data.keyPara;
    }
    get selector(): string {
        return this.data.selector;
    }
    @value()
    get value(): string | number | boolean {
        return this.data.values_replaced['value'];
    }
}
