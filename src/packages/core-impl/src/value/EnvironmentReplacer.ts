import { EnvLoader, ScopedType, ValueReplacer } from '@boart/core';

export class EnvironmentReplacer implements ValueReplacer {
    readonly name = 'env';

    /**
     *
     */
    get scoped(): ScopedType {
        return ScopedType.false;
    }

    /**
     *
     */
    get priority(): number {
        return 1000;
    }

    /**
     *
     */
    replace(property: string): string {
        return EnvLoader.instance.get(property, null, true);
    }
}
