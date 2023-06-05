import { SelectorToken, IndexToken, Nullable } from '../ASTTypes';
import { SelectorType } from './SelectorType';

/**
 *
 */
export interface SelectorDef {
    kind: SelectorType | 'SelectorSimple';
    value: SelectorToken;
    index?: IndexToken;
    startIndex?: IndexToken;
    endIndex?: Nullable<IndexToken>;
    count?: Nullable<string>;
    list?: Array<{
        index: IndexToken;
    }>;
}
