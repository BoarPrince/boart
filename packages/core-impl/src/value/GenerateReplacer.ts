import { GeneratorHandler, ScopedType, ValueReplacer } from '@boart/core';

/**
 *
 */
export class GenerateReplacer implements ValueReplacer {
    readonly name = 'GenerateReplacer';

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
    replace(definition: string): string {
        return GeneratorHandler.instance.generate(definition);
    }
}
