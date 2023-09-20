import { DefaultOperator } from './DefaultOperator';
import { Name } from './Name';
import { Pipe } from './Pipe';
import { Qualifier } from './Qualifier';
import { Scope } from './Scope';
import { Selector } from './Selector';

/**
 *
 */
interface SelectorArray extends Array<Selector> {
    stringValue?: string;
}

/**
 *
 */
export interface ASTVariable {
    name: Name;
    scope?: Scope;
    qualifier?: Qualifier;
    selectors?: SelectorArray;
    default?: DefaultOperator;
    pipes?: Pipe[];
    match: string;
}
