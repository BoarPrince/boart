import { ScopedType, TextLanguageHandler, ValueReplaceArg, ValueReplacer, ValueReplacerConfig } from '@boart/core';

export class TextReplacer implements ValueReplacer {
    readonly name = 'text';

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
        return 950;
    }

    /**
     *
     * @param ast parser arguments
     */
    replace(ast: ValueReplaceArg): string {
        return TextLanguageHandler.instance.get(ast.qualifier.value);
    }
}
