import { Pipe } from './Pipe';
import { Qualifier } from './Qualifier';
import { Scope } from './Scope';
import { Selector } from './Selector';
import { Name as Name } from './Name';
import { DefaultOperator } from './DefaultOperator';

/**
 *
 */
export interface ASTVariable {
    name: Name;
    scope?: Scope;
    qualifier?: Qualifier;
    selectors?: Selector[];
    default?: DefaultOperator;
    pipes?: Pipe[];
    match: string;
}
