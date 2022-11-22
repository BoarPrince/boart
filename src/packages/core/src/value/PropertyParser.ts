import { PropertyIterable } from './PropertyIterable';

/**
 *
 */
type DefaultOp = {
    operator: string;
    value: string;
};

/**
 *
 */
export class PropertyParser {
    /**
     *
     */
    private constructor(readonly replacer: string, readonly isOptional: boolean, readonly scope: string, readonly name: string) {}
    // private constructor(
    //     readonly replacer: string,
    //     readonly isOptional: boolean,
    //     readonly scope: string,
    //     readonly property: string,
    //     readonly selector: string,
    //     readonly defaultOp: DefaultOp
    // ) {}

    /**
     *
     */
    public static parseProperty(selector: string): PropertyIterable {
        selector = (selector || '') //
            .replace(/^\[(\d+)\]/g, '$1') // [0].x.x   -> 0.x.x
            .replace(/\[(\d+)\]/g, '.$1'); // x.x[0].x -> x.x.0.x
        const keys = !selector ? [] : selector.split(/[#.]/);

        return new PropertyIterable(keys);
    }

    /**
     *
     */
    public static parse(value: string): PropertyParser {
        // const re = new RegExp(
        //     /\${(?<replacer>[^{}?:]+?)(?<optional>[?]?)(:(?<scope>[glts]))?(:(?<property>[^{}#:]+))?(#(?<selector>[^{}#:]+))?((?<defaultOperator>:[^\w\d])(?<default>[^{}]+))?}/
        // );
        const re = new RegExp(/\${(?<replacer>[^{}?:]+?)(?<optional>[?]?):((?<scope>[glts]):)?(?<property>[^{}]+)}/);
        const match = re.exec(value);
        if (match) {
            const replacer = match.groups.replacer;
            const optional = match.groups.optional;
            const scope = match.groups.scope;
            const property = match.groups.property;
            // const selector = match.groups.selector;
            // const defaultOperator = match.groups.defaultOperator;
            // const defaultValue = match.groups.default;

            return new PropertyParser(replacer, !!optional, scope, property);
            // return new PropertyParser(replacer, !!optional, scope, property, selector, { operator: defaultOperator, value: defaultValue });
        } else {
            return null;
        }
    }
}
