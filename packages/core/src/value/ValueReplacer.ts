import { ScopedType } from '../types/ScopedType';

export interface ValueReplacer {
    readonly name: string;
    readonly priority: number;
    readonly scoped: ScopedType;
    readonly nullable?: boolean;
    readonly getProperty?: (property: string) => string;
    replace(property: string): string | null | undefined;
}
