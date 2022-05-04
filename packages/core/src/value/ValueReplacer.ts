import { ScopedType } from '../types/ScopedType';

export interface ValueReplacer {
    readonly name: string;
    readonly priority: number;
    readonly scoped: ScopedType;
    readonly getProperty?: (property: string) => string;
    replace(property: string): string;
}
