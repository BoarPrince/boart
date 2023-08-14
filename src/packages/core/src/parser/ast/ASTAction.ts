import { Qualifier } from './Qualifier';
import { Scope } from './Scope';
import { Selector } from './Selector';
import { Name } from './Name';

/**
 *
 */
export interface ASTAction {
    name: Name;
    scope?: Scope;
    qualifier?: Qualifier;
    selectors?: Selector[];
    match: string;
}
