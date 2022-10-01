/**
 *
 */

export class PropertyParser {
    /**
     *
     */
    private constructor(readonly replacer: string, readonly isOptional: boolean, readonly scope: string, readonly name: string) {}

    /**
     *
     */
    public static parse(value: string): PropertyParser {
        const re = new RegExp(/\${(?<replacer>[^{}?:]+?)(?<optional>[?]?):((?<scope>[glts]):)?(?<property>[^{}]+)}/);
        const match = re.exec(value);
        if (match) {
            const replacer = match.groups.replacer;
            const optional = match.groups.optional;
            const scope = match.groups.scope;
            const property = match.groups.property;

            return new PropertyParser(replacer, !!optional, scope, property);
        } else {
            return null;
        }
    }
}
