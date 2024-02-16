import { BaseRowMetaDefinition, ObjectValidator, RowValidator, ValidatorFactory, ValidatorType } from '@boart/core';

/**
 *
 */
type ValuePara = { key: string; value: string; column: string };

/**
 *
 */
export class DependsOnValueValidator implements RowValidator {
    readonly name = 'DependsOnValueValidator';
    private readonly dependOn: Array<ValuePara>;

    /**
     * F A C T O R Y
     */
    constructor(dependOn: Array<ValuePara> | ValuePara) {
        this.dependOn = Array.isArray(dependOn) ? dependOn : [dependOn];
    }

    /**
     *
     */
    public static factory(): ValidatorFactory {
        return {
            name: 'DependsOnValueValidator',
            type: ValidatorType.ROW,

            /**
             *
             */
            check(para: string | Array<unknown> | object): boolean {
                ObjectValidator.instance(para)
                    .notNull()
                    .shouldArray()
                    .onlyContainsProperties(['key', 'value', 'column'])
                    .prop('key')
                    .shouldString()
                    .prop('value')
                    .shouldString()
                    .prop('column')
                    .shouldString();
                return true;
            },

            /**
             *
             */
            create(para: string | Array<unknown> | object): RowValidator {
                return new DependsOnValueValidator(para as Array<ValuePara>);
            }
        };
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(row: BaseRowMetaDefinition<any, any>, rows: readonly BaseRowMetaDefinition<any, any>[]) {
        let count = 0;
        this.dependOn.forEach((dependOn) => {
            rows.filter((r) => r.ast.name.value === dependOn.key)
                .filter((r) => r.values_replaced[dependOn.column] === dependOn.value)
                .forEach(() => count++);
        });

        if (count === 0) {
            throw Error(
                `key '${row._metaDefinition.key.description || ''}' depends on key: ${this.dependOn
                    .map((d) => `'${d.key} -> action:${d.value}'`)
                    .join(' or ')}, but it does not exist!`
            );
        }
    }
}
