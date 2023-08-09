import { ASTVariable } from '../parser/ast/ASTVariable';
import { StoreWrapper } from '../store/StoreWrapper';
import { ScopeType } from '../types/ScopeType';
import { ScopedType } from '../types/ScopedType';

/**
 *
 */
export interface ReplaceArg extends Omit<ASTVariable, 'scope' | 'match' | 'name'> {
    match?: string;
}

/**
 *
 */
export class ValueReplacerConfig {
    scopeAllowed?: boolean;
    defaultScopeType?: ScopeType;
    hasQualifier?: boolean;
    qualifierParaCountMin?: number;
    qualifierParaCountMax?: number;
    selectorsCountMin?: number;
    selectorsCountMax?: number;
    hasDefaultOpertor?: boolean;
}

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

    readonly config: ValueReplacerConfig;
    replace2?(arg: ReplaceArg, store?: StoreWrapper): string;
}
