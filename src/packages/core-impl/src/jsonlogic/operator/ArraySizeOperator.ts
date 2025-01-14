import { JsonLogicOperator } from '../JsonLogicOperator';
import { JsonLogicOperatorInitializer } from '../JsonLogicOperatorInitializer';

/**
 *
 */
@JsonLogicOperatorInitializer
export class ArraySizeOperator implements JsonLogicOperator {
    readonly name = 'array.size';

    /**
     *
     */
    execute(value: readonly unknown[] | unknown): number {
        if (!!value && Array.isArray(value)) {
            return value.length;
        } else if (!!value && typeof value === 'object' && value.constructor === Object) {
            return Object.keys(value).length;
        } else {
            return 0;
        }
    }
}
