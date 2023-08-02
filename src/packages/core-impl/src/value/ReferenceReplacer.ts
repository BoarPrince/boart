import { ScopedType, StoreWrapper, ValueReplacer, ReplaceArg, ScopeType } from '@boart/core';

import { ReferenceHandler } from './ReferenceHandler';

export class ReferenceReplacer implements ValueReplacer {
    readonly name = 'ref';
    readonly defaultScopeType2 = ScopeType.Test;

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
    replace(property: string, store: StoreWrapper): string {
        const storeIdentifier = `#${this.name}#:#${property}#`;
        const baseStore = store.store;

        let content: string = baseStore.get(storeIdentifier)?.toString();
        if (!content) {
            content = this.getPropertyValue(property);
            baseStore.put(storeIdentifier, content);
        }

        return content;
    }

    /**
     * 
     * @param arg parser arguments
     * @param store store to be used
     */
    replace2(arg: ReplaceArg, store: StoreWrapper): string {

        const fileName = [arg.qualifier.value].concat(arg.qualifier.paras || []).join('/');
        const selector = arg.selectors[0].value;
        const storeIdentifier = `#${this.name}#:#${fileName}#${selector}#`;
        const baseStore = store.store;

        let content: string = baseStore.get(storeIdentifier)?.toString();
        if (!content) {
            content = ReferenceHandler.getProperty(fileName, selector);
            baseStore.put(storeIdentifier, content);
        }

        return content;
    }
}
