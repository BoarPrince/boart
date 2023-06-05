import { ActionToken } from '../ASTTypes';
import { ASTKinds } from '../ASTKinds';

/**
 *
 */
export interface Action {
    kind: ASTKinds.Action;
    rootAction: ActionToken;
    subActions: Array<{
        action: ActionToken;
    }>;
}
