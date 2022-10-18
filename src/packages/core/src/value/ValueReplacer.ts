import { StoreWrapper } from '../store/StoreWrapper';
import { ScopeType } from '../types/ScopeType';
import { ScopedType } from '../types/ScopedType';

/**
 *
 */
export interface ValueReplacer {
    readonly name: string;
    readonly priority: number;
    readonly scoped: ScopedType;
    readonly nullable?: boolean;
    defaultScopeType?(property?: string): ScopeType;
    replace(property: string, store?: StoreWrapper, scope?: ScopeType): string;
}
