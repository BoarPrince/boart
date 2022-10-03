import { GeneratorHandler, ScopedType, StoreMap, ValueReplacer } from '@boart/core';

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
    replace(property: string, store: StoreMap): string {
        const storeIdentifier = `#${this.name}#:#${property}#`;

        let content: string = store.get(storeIdentifier)?.toString();
        if (!content) {
            content = GeneratorHandler.instance.generate(property);
            store.put(storeIdentifier, content);
        }

        return content;
    }
}
