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
     * @param ast parser arguments
     * @param store store to be used
     */
    replace(ast: ValueReplaceArg, store?: StoreWrapper): string {
        const baseStore = store.store;

        const qualifier = ast.qualifier.stringValue;
        const datascope = ast.datascope?.value;

        const storeIdentifier = datascope
            ? StoreMap.getStoreIdentifier(`#${this.name}#:#${datascope}#:#${qualifier}#`)
            : StoreMap.getStoreIdentifier(`#${this.name}#:#${qualifier}#`);

        let content: string = baseStore.get(storeIdentifier)?.toString();
        if (!content) {
            content = GeneratorHandler.instance.generate(ast);
            baseStore.put(storeIdentifier, content);
        }

        return content;
    }
}
