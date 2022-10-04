import { GeneratorHandler, ScopedType, StoreWrapper, ValueReplacer } from '@boart/core';

/**
 *
 */
export class GenerateReplacer implements ValueReplacer {
    readonly name = 'generate';

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
    replace(property: string, store: StoreWrapper): string {
        const baseStore = store.store;
        const storeIdentifier = `#${this.name}#:#${property}#`;

        let content: string = baseStore.get(storeIdentifier)?.toString();
        if (!content) {
            content = GeneratorHandler.instance.generate(property);
            baseStore.put(storeIdentifier, content);
        }

        return content;
    }
}
