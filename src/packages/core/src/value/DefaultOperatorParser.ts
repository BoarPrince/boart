import { DefaultOperator } from './DefaultOperator';

/**
 *
 */
export class DefaultOperatorParser {
    private static readonly defaultRe = /^(?<property>[^:]+)((?<operator>:[^\w\d])(?<default>.*))?$/;
    private static readonly operatorRe = /^(?<property>[^:]+)(:(?<operator>.+))?$/;

    /**
     *
     */
    private constructor(readonly property: string, readonly operator: DefaultOperator, readonly defaultValue: string) {}

    /**
     *
     */
    public static parse(definition: string): DefaultOperatorParser {
        const match = definition.match(DefaultOperatorParser.defaultRe) || definition.match(DefaultOperatorParser.operatorRe);
        if (!match) {
            throw new Error(`expression '${definition}' not valid`);
        }

        const defaultOperator = new DefaultOperator(match.groups.operator);
        if (defaultOperator.isDefault && !match.groups.default) {
            throw new Error(`expression '${definition}' requires a default value`);
        }

        return new DefaultOperatorParser(match.groups.property, defaultOperator, match.groups.default);
    }
}
