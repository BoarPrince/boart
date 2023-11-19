import {
    GeneratorHandler,
    ScopedType,
    ScopeType,
    StoreMap,
    StoreWrapper,
    ValueReplaceArg,
    ValueReplacer,
    ValueReplacerConfig
} from '@boart/core';

/**
 *
 */
export class GenerateReplacer implements ValueReplacer {
    readonly name = 'generate';

    /**
     *
     */
    readonly config: ValueReplacerConfig = {
        scopeAllowed: true,
        hasQualifier: true,
        qualifierParaCountMin: 0,
        defaultScopeType: ScopeType.Test
    };

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
    replace(arg: ValueReplaceArg, store?: StoreWrapper): string {
        const baseStore = store.store;

        const qualifier = arg.qualifier.stringValue;

        const storeIdentifier = store
            ? StoreMap.getStoreIdentifier(`#${this.name}#:#${store.storeName}#:#${qualifier}#`)
            : StoreMap.getStoreIdentifier(`#${this.name}#:#${qualifier}#`);

        let content: string = baseStore.get(storeIdentifier)?.toString();
        if (!content) {
            content = GeneratorHandler.instance.generate(qualifier);
            baseStore.put(storeIdentifier, content);
        }

        return content;
    }
}
