import { EnvLoader, ScopedType, ValueReplaceArg, ValueReplacer, ValueReplacerConfig } from '@boart/core';

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
        return ScopedType.False;
    }

    /**
     *
     */
    get priority(): number {
        return 1000;
    }

    /**
     *
     * @param arg parser arguments
     */
    replace(ast: ValueReplaceArg): string {
        const key: string = ast?.qualifier?.stringValue;
        return EnvLoader.instance.get(key, null, true);
    }
}
