import { ActionToken } from '../ASTTypes';
import { ASTKinds } from '../ASTKinds';

/**
 *
 */
export interface DataScope {
    kind: ASTKinds.DataScope;
    value: ActionToken;
}
