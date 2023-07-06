import { Nullable, Token as IdentifierToken, Token } from './ASTTypes';
import { SyntaxErr } from './error/SyntaxErr';
import { SelectorDef } from './selector/SelectorDef';

/**
 *
 */
export interface ASTVariable {
    ast: Nullable<{
        name: IdentifierToken;
        qualifiers: Array<{
            value: Token;
        }>;
        selectors: Array<{
            def: SelectorDef;
        }>;
        scope: Nullable<{
            value: Token;
        }>;
    }>;
    errs: SyntaxErr[];
}
