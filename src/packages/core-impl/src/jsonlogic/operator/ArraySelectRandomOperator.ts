import { JsonLogicOperator } from '../JsonLogicOperator';
import { JsonLogicOperatorInitializer } from '../JsonLogicOperatorInitializer';

/**
 *
 */
@JsonLogicOperatorInitializer
export class ArraySelectRandomOperator implements JsonLogicOperator {
    readonly name = 'array.random';

    /**
     *
     */
    execute(value: readonly unknown[] | unknown): unknown {
        if (!!value && Array.isArray(value)) {
            return value[Math.floor(Math.random() * value.length)];
        } else if (!!value && typeof value === 'object' && value.constructor === Object) {
            const keys = Object.keys(value);
            const randomKey = Math.floor(Math.random() * keys.length);
            return value[keys[randomKey]];
        } else {
            return value;
        }
    }
}
