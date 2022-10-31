import { DefaultOperator } from './DefaultOperator';

/**
 *
 */
export class DefaultOperatorParser {
    private static readonly re = /^(?<property>[^:]+)((?<operator>:.)(?<default>.+))?$/;

    /**
     *
     */
    private constructor(readonly property: string, readonly operator: DefaultOperator, readonly defaultValue: string) {}

    /**
     *
     */
    public static parse(definition: string): DefaultOperatorParser {
        const match = definition.match(DefaultOperatorParser.re);
        if (!match) {
            throw new Error(`expression '${definition}' not valid`);
        }

        return new DefaultOperatorParser(match.groups.property, new DefaultOperator(match.groups.operator), match.groups.default);
    }
}
