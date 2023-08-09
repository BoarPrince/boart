import { Context, DataContentHelper, DefaultOperatorParser, OperatorType, ScopedType, ValueReplacer } from '@boart/core';
import { ValueReplacerConfig } from './ValueReplacer';

/**
 *
 */
export class ContextReplacer implements ValueReplacer {
    readonly name = 'context';

    readonly scoped = ScopedType.false;
    readonly nullable = true;

    /**
     *
     */
    readonly config: ValueReplacerConfig = {
        hasQualifier: true
    };

    /**
     *
     */
    get priority(): number {
        return 950;
    }

    /**
     *
     */
    replace(property: string): string {
        const defaultOperator = DefaultOperatorParser.parse(property);
        const operator = defaultOperator.operator;

        if (![OperatorType.None, OperatorType.Default].includes(operator.type)) {
            throw Error(`default operator '${defaultOperator.operator.value}' not allowed`);
        }

        const value = Context.instance.get(defaultOperator.property);
        if (!DataContentHelper.isNullOrUndefined(value)) {
            return value.toString();
        }

        if (operator.type === OperatorType.None) {
            throw Error(`context '${defaultOperator.property}' not defined`);
        }

        return defaultOperator.defaultValue;
    }
}
