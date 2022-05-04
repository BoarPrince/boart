import { TextLanguageHandler } from '../../common/TextLanguageHandler';
import { ScopedType } from '../../types/ScopedType';
import { ValueReplacer } from '../../value/ValueReplacer';

export class TextReplacer implements ValueReplacer {
    readonly name = 'TextReplacer';

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
