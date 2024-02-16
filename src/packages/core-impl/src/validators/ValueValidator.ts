import { BaseRowMetaDefinition, ObjectValidator, RowValidator, ValidatorFactory, ValidatorType } from '@boart/core';

/**
 *
 */
type AllowedValue = {
    value: string;
    validators?: Array<RowValidator>;
};

/**
 *
 */
export class ValueValidator implements RowValidator {
    private readonly allowedValues: Array<AllowedValue>;

    /**
     *
     */
    constructor(
        private readonly property: string,
        allowedValues: ReadonlyArray<string | AllowedValue>
    ) {
        this.allowedValues = allowedValues.map((v) => (typeof v === 'string' ? { value: v } : v));
    }

    /**
     * F A C T O R Y
     */
    public static factory(): ValidatorFactory {
        return {
            name: 'ValueValidator',
            type: ValidatorType.ROW,

            /**
             *
             */
            check(para: string | Array<unknown> | object): boolean {
                ObjectValidator.instance(para)
                    .notNull()
                    .shouldArray()
                    .prop('property')
                    .shouldString()
                    .prop('allowedValues')
                    .shouldArray('string');
                return true;
            },

            /**
             *
             */
            create(para: string | Array<unknown> | object): RowValidator {
                type ParaType = { property: string; allowdValues: Array<string> };
                const property = (para as ParaType).property;
                const allowdValues = (para as ParaType).allowdValues;
                return new ValueValidator(property, allowdValues);
            }
        };
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(row: BaseRowMetaDefinition<any, any>, rows: readonly BaseRowMetaDefinition<any, any>[]) {
        const value = !row.values_replaced ? null : row.values_replaced[this.property];
        const matchedValue = !value ? null : this.allowedValues.find((v) => value === v.value);

        // run associated validators
        matchedValue?.validators?.forEach((validator) => {
            try {
                validator.validate(row, rows);
            } catch (error) {
                throw Error(
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    (error.message as string).replace(row.ast.name.stringValue, `${row.ast.name.stringValue}:${matchedValue.value}`)
                );
            }
        });

        if (!!value && !matchedValue) {
            throw Error(
                `Value '${value.toString()}' of key/column: '${row.ast.name.stringValue}/${
                    this.property
                }' is not defined. Allowed is ${this.allowedValues.map((v) => `'${v.value}'`).join(' or ')}`
            );
        }
    }
}
