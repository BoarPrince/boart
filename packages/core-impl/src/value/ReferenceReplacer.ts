import { ScopedType, ValueReplacer } from '@boart/core';

import { ReferenceHandler } from './ReferenceHandler';

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
