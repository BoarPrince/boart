import { EnvLoader } from '../../common/EnvLoader';
import { ScopedType } from '../../types/ScopedType';
import { ValueReplacer } from '../../value/ValueReplacer';

export class EnvironmentReplacer implements ValueReplacer {
    readonly name = 'EnvironmentReplacer';

    /**
     *
     */
    get scoped(): ScopedType {
        return ScopedType.false;
    }

    /**
     *
     */
    get priority(): number {
        return 1000;
    }

    /**
     *
     */
    replace(property: string): string {
        return EnvLoader.instance.get(property, null, true);
    }
}
