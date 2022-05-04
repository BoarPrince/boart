import { ScopedType } from '../../types/ScopedType';
import { ValueReplacer } from '../../value/ValueReplacer';

export class StoreReplacer implements ValueReplacer {
    private static readonly re = /^(?<property>[^:]+)(:-(?<default>.*))?$/;
    readonly name = 'StoreReplacer';

    /**
     *
     */
    get scoped(): ScopedType {
        return ScopedType.multiple;
    }

    /**
     *
     */
    get priority(): number {
        return 950;
    }

    /**
     *
     */
    getProperty(property: string): string {
        const match = property.match(StoreReplacer.re);
        return match.groups.property;
    }

    /**
     *
     */
    replace(property: string): string {
        const match = property.match(StoreReplacer.re);
        return match.groups.default;
    }
}
