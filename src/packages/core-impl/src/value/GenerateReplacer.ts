import { GeneratorHandler, ScopedType, ScopeType, StoreWrapper, ValueReplacer } from '@boart/core';
import { ReplaceArg, ValueReplacerConfig } from './ValueReplacer';

/**
 *
 */
export class GenerateReplacer implements ValueReplacer {
    private static readonly re = /^(@(?<scopename>[^@:]+):)?(?<property>.+)$/;
    readonly name = 'generate';

    /**
     *
     */
    readonly config: ValueReplacerConfig = {
        scopeAllowed: true,
        hasQualifier: true,
        qualifierParaCountMin: 1,
        defaultScopeType: ScopeType.None
    };

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
    defaultScopeType(property: string): ScopeType {
        const match = property.match(GenerateReplacer.re);
        return !match.groups.scopename ? null : ScopeType.Step;
    }

    /**
     *
     */
    replace(property: string, store: StoreWrapper): string {
        const baseStore = store.store;

        const match = property.match(GenerateReplacer.re);
        property = match.groups.property;

        const storeIdentifier = match.groups.scopename
            ? `#${this.name}#:#${match.groups.scopename}#:#${property}#`
            : `#${this.name}#:#${property}#`;

        let content: string = baseStore.get(storeIdentifier)?.toString();
        if (!content) {
            content = GeneratorHandler.instance.generate(property);
            baseStore.put(storeIdentifier, content);
        }

        return content;
    }

    /**
     *
     * @param arg parser arguments
     * @param store store to be used
     */
    replace2(arg: ReplaceArg, store?: StoreWrapper): string {
        const baseStore = store.store;

        const qualifier = [arg.qualifier.value].concat(arg.qualifier.paras || []).join(':');

        const storeIdentifier = store ? `#${this.name}#:#${store.storeName}#:#${qualifier}#` : `#${this.name}#:#${qualifier}#`;

        let content: string = baseStore.get(storeIdentifier)?.toString();
        if (!content) {
            content = GeneratorHandler.instance.generate(qualifier);
            baseStore.put(storeIdentifier, content);
        }

        return content;
    }
}
