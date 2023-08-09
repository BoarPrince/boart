import { EnvLoader, ScopedType, ValueReplacer } from '@boart/core';
import { ReplaceArg, ValueReplacerConfig } from './ValueReplacer';

export class EnvironmentReplacer implements ValueReplacer {
    readonly name = 'env';

    /**
     *
     */
    readonly config: ValueReplacerConfig = {
        hasQualifier: true
    };

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

    /**
     *
     * @param arg parser arguments
     */
    replace2?(arg: ReplaceArg): string {
        return EnvLoader.instance.get(arg.qualifier.value, null, true);
    }
}
