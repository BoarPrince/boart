import { BaseRowMetaDefinition, RowValidator } from '@boart/core';

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
    constructor(private readonly property: string, allowedValues: ReadonlyArray<string | AllowedValue>) {
        this.allowedValues = allowedValues.map((v) => (typeof v === 'string' ? { value: v } : v));
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
                throw Error((error.message as string).replace(row.key, `${row.key}:${matchedValue.value}`));
            }
        });

        if (!!value && !matchedValue) {
            throw Error(
                `Value '${value.toString()}' of key/column: '${row.key}/${this.property}' is not defined. Allowed is ${this.allowedValues
                    .map((v) => `'${v.value}'`)
                    .join(' or ')}`
            );
        }
    }
}
