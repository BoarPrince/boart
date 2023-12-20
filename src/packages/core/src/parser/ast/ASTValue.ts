import { Name } from './Name';
import { Scope } from './Scope';
import { SelectorArray } from './SelectorArray';

/**
 *
 */
export interface ASTValue {
    scope?: Scope;
    name?: Name;
    qualifier?: null;
    selectors?: SelectorArray;
    match: string;
}
