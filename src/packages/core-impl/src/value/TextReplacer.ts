import { ScopedType, TextLanguageHandler, ValueReplacer } from '@boart/core';

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
}
