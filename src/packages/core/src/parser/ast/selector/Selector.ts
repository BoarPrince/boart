import { SelectorDef } from './SelectorDef';
import { ASTKinds } from '../ASTKinds';

/**
 *
 */
export interface Selector {
    kind: 'Selector';
    rootSelector: SelectorDef;
    subSelectors: Array<{
        selector: SelectorDef;
    }>;
}
