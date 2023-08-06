import { ScopedType, TextLanguageHandler, ValueReplacer } from '@boart/core';
import { ReplaceArg } from './ValueReplacer';

export class TextReplacer implements ValueReplacer {
    readonly name = 'text';

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
        return 950;
    }

    /**
     *
     */
    replace(property: string): string {
        return TextLanguageHandler.instance.get(property);
    }

    /**
     * 
     * @param arg parser arguments
     */
    replace2?(arg: ReplaceArg): string {
        return TextLanguageHandler.instance.get(arg.qualifier.value);
    }
}
