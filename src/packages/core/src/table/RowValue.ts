import { ASTAction } from '../parser/ast/ASTAction';

/**
 *
 */
export interface RowValue {
    readonly key: string;
    ast: ASTAction;
    readonly values: Record<string, string>;
    readonly values_replaced: Record<string, string>;
}
