import { BaseRowMetaDefinition, ObjectValidator, RowValidator, ValidatorFactory, ValidatorType } from '@boart/core';

/**
 *
 */
export class DependsOnValidator implements RowValidator {
    /**
     *
     */
    constructor(private readonly dependOnKey: string[]) {}

    /**
     * F A C T O R Y
     */
    public static factory(): ValidatorFactory {
        return {
            name: 'DependsOnValidator',
            type: ValidatorType.ROW,

            /**
             *
             */
            check(para: string | Array<string> | object): boolean {
                ObjectValidator.instance(para).notNull().shouldArray('string');
                return true;
            },

            /**
             *
             */
            create(para: string | Array<string> | Map<string, string>): RowValidator {
                if (!para) {
                    throw new Error('parameter of DataScopeValidator is not defined');
                }
                if (!Array.isArray(para)) {
                    throw new Error(`parameter must be of type array -> '${JSON.stringify(para)}' `);
                } else {
                    return new DependsOnValidator(para);
                }
            }
        };
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(row: BaseRowMetaDefinition<any, any>, rows: readonly BaseRowMetaDefinition<any, any>[]) {
        let count = 0;
        this.dependOnKey.forEach(
            (key) => rows?.forEach((r) => (count += r.ast.name.value === key || r.ast.name.stringValue === key ? 1 : 0))
        );

        if (count === 0) {
            throw Error(
                `key '${row._metaDefinition.key.description || ''}' depends on ${this.dependOnKey
                    .map((k) => `'${k}'`)
                    .join(' or ')}, but it does not exist!`
            );
        }
    }
}
