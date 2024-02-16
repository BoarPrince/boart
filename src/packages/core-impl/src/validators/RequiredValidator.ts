import { BaseRowMetaDefinition, GroupValidator, ObjectValidator, ValidatorFactory, ValidatorType } from '@boart/core';

/**
 * Key must occur
 */
export class RequiredValidator implements GroupValidator {
    /**
     *
     */
    constructor(private readonly keys: readonly symbol[]) {}

    /**
     * F A C T O R Y
     */
    public static factory(): ValidatorFactory {
        return {
            name: 'RequiredValidator',
            type: ValidatorType.GROUP,

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
                return new RequiredValidator(paras);
            }
        };
    }

    /**
     *
     */
    get name() {
        return 'RequiredValidator';
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(rows: readonly BaseRowMetaDefinition<any, any>[]) {
        this.keys.forEach((key) => {
            const count = rows.filter((row) => row.ast.name.stringValue.startsWith(key.description))?.length || 0;
            if (count === 0) {
                throw Error(`Key '${key.description.toString()}' is required, but it's missing`);
            }
        });
    }
}
