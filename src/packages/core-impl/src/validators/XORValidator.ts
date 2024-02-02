import { BaseRowMetaDefinition, GroupValidator, ObjectValidator, ValidatorFactory } from '@boart/core';

/**
 *
 */
export class XORValidator implements GroupValidator {
    /**
     *
     */
    constructor(private readonly keys: readonly symbol[]) {}

    /**
     *
     */
    readonly name = 'XORValidator';

    /**
     * F A C T O R Y
     */
    public static factory(): ValidatorFactory {
        return {
            name: 'XORValidator',

            /**
             *
             */
            check(para: string | Array<unknown> | object): boolean {
                ObjectValidator.instance(para).notNull().shouldArray('string');
                return true;
            },

            /**
             *
             */
            create(para: string | Array<unknown> | object): GroupValidator {
                const paras = (para as Array<string>).map((p) => Symbol(p));
                return new XORValidator(paras);
            }
        };
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(rows: readonly BaseRowMetaDefinition<any, any>[]) {
        const keys = this.keys.map((k) => k.description);

        const existingKeys = rows.reduce((o: Array<unknown>, r) => {
            const key = r.ast.name.stringValue;
            if (keys.includes(key)) {
                o.push(key);
            }
            return o;
        }, []);

        if (existingKeys.length === 0) {
            throw Error(`One of the following keys '${keys?.join(', ')}' must exists, but no one exists`);
        } else if (existingKeys.length > 1) {
            throw Error(`Only one of the keys '${keys?.join(' or ')}' must exists, but '${existingKeys?.join(' and ')}' exists`);
        }
    }
}
