import { ReferenceHandler } from '../../common/ReferenceHandler';
import { ScopedType } from '../../types/ScopedType';
import { ValueReplacer } from '../../value/ValueReplacer';

export class ReferenceReplacer implements ValueReplacer {
    readonly name = 'ReferenceReplacer';

    /**
     *
     */
    get scoped(): ScopedType {
        return ScopedType.true;
    }

    /**
     *
     */
    get priority(): number {
        return 900;
    }

    /**
     *
     */
    replace(property: string): string {
        const match = property.match(/^([^#]+)#([^#]+)$/);
        if (!!match) {
            return ReferenceHandler.getProperty(match[1], match[2]);
        } else {
            return null;
        }
    }
}
