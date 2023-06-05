import { Selector } from './selector/Selector';
import { DataScope } from './dataScope/DataScope';
import { Action } from './action/Action';
import { Nullable } from './ASTTypes';
import { SyntaxErr } from './error/SyntaxErr';

/**
 *
 */
export interface ASTTable {
    ast: Nullable<{
        action: Action;
        selector: Nullable<Selector>;
        dataScope: Nullable<DataScope>;
    }>;
    errs: SyntaxErr[];
}
