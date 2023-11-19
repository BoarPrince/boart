import { Qualifier } from './Qualifier';
import { Scope } from './Scope';
import { SelectorArray } from './SelectorArray';

/**
 *
 */
export interface ASTValue {
    scope?: Scope;
    qualifier?: Qualifier;
    selectors?: SelectorArray;
    match: string;
}
