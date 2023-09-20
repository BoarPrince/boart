import { DataScope } from './DataScope';
import { Name } from './Name';
import { Qualifier } from './Qualifier';
import { Scope } from './Scope';
import { Selector } from './Selector';

/**
 *
 */
interface SelectorArray extends Array<Selector> {
    stringValue: string;
}

/**
 *
 */
export interface ASTAction {
    name: Name;
    scope?: Scope;
    qualifier?: Qualifier;
    datascope?: DataScope;
    selectors?: SelectorArray;
    match: string;
}
