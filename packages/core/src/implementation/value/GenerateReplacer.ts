import { GeneratorHandler } from '../../generator/GeneratorHandler';
import { ScopedType } from '../../types/ScopedType';
import { ValueReplacer } from '../../value/ValueReplacer';

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
