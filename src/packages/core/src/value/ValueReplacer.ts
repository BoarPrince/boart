import { StoreMap } from '../store/StoreMap';
import { ScopeType } from '../types/ScopeType';
import { ScopedType } from '../types/ScopedType';

export interface ValueReplacer {
    readonly name: string;
    readonly priority: number;
    readonly scoped: ScopedType;
    readonly nullable?: boolean;
    replace(property: string, store?: StoreMap, scope?: ScopeType): string;
}
