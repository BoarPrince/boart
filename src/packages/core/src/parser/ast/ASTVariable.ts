import { DefaultOperator } from './DefaultOperator';
import { Name } from './Name';
import { Pipe } from './Pipe';
import { Qualifier } from './Qualifier';
import { Scope } from './Scope';
import { SelectorArray } from './SelectorArray';

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
