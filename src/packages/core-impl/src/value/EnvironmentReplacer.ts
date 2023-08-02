import { EnvLoader, ScopedType, StoreWrapper, ValueReplacer } from '@boart/core';
import { ReplaceArg } from './ValueReplacer';

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

    /**
     * 
     * @param arg parser arguments
     */
    replace2?(arg: ReplaceArg): string {
        return EnvLoader.instance.get(arg.qualifier.value, null, true);
    }
}
