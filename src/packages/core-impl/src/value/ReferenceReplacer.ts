import { ScopedType, StoreMap, ValueReplacer } from '@boart/core';

import { ReferenceHandler } from './ReferenceHandler';

export class ReferenceReplacer implements ValueReplacer {
    readonly name = 'ref';

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
    private getPropertyValue(property: string): string {
        const match = property.match(/^([^#]+)#([^#]+)$/);
        if (!!match) {
            return ReferenceHandler.getProperty(match[1], match[2]);
        } else {
            return null;
        }
    }

    /**
     *
     */
    replace(property: string, store: StoreMap): string {
        const storeIdentifier = `#${this.name}#:#${property}#`;

        let content: string = store.get(storeIdentifier)?.toString();
        if (!content) {
            content = this.getPropertyValue(property);
            store.put(storeIdentifier, content);
        }

        return content;
    }
}
