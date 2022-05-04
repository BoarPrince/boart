import { JsonLogicOperator } from '../../common/jsonlogic/JsonLogicOperator';
import { JsonLogicOperatorInitializer } from '../../common/jsonlogic/JsonLogicOperatorInitializer';

/**
 *
 */
@JsonLogicOperatorInitializer
export class ArraySizeOperator implements JsonLogicOperator {
    readonly name = 'string.replace';

    /**
     *
     */
    execute(value: readonly unknown[] | unknown, from: string, to: string): number {
        const str_value = typeof value === 'string' ? value : JSON.stringify(value);
        return JSON.parse(str_value.replace(from, to));
    }
}
