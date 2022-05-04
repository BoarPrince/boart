import { JsonLogicOperator } from '../../common/jsonlogic/JsonLogicOperator';
import { JsonLogicOperatorInitializer } from '../../common/jsonlogic/JsonLogicOperatorInitializer';

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
