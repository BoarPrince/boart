import { ReplaceArg, ScopedType, ScopeType, StoreMap, StoreWrapper, ValueReplaceArg, ValueReplacer } from '@boart/core';

import { ReferenceHandler } from './ReferenceHandler';

/**
 *
 */
export class ReferenceReplacer implements ValueReplacer {
    readonly name = 'ref';
    readonly config = {};
    readonly defaultScopeType2 = ScopeType.Test;

    /**
     *
     */
    get scoped(): ScopedType {
        return ScopedType.True;
    }

    /**
     *
     */
    get priority(): number {
        return 900;
    }

    /**
     *
     * @param arg parser arguments
     * @param store store to be used
     */
    replace(arg: ReplaceArg, store: StoreWrapper): string {
        const fileName = [arg.qualifier.value].concat(arg.qualifier.paras || []).join('/');
        const selector = arg.selectors[0].value;

        const storeIdentifier = StoreMap.getStoreIdentifier(`#${this.name}#:#${fileName}#${selector}#`);
        const baseStore = store.store;

        let content: string = baseStore.get(storeIdentifier)?.toString();
        if (!content) {
            content = ReferenceHandler.getProperty(fileName, selector);
            baseStore.put(storeIdentifier, content);
        }

        return content;
    }
}
