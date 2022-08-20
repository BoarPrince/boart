import { BaseRowMetaDefinition, RowValidator } from '@boart/core';

/**
 *
 */
export class ValueValidator implements RowValidator {
    constructor(private readonly property: string, private readonly allowedValues: readonly string[]) {}

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(row: BaseRowMetaDefinition<any, any>) {
        if (
            !!row.values_replaced &&
            !this.allowedValues.some(
                (allowedValue) => row.values[this.property] === allowedValue || (!allowedValue && row.values[this.property])
            )
        ) {
            const value = row.values_replaced[this.property];
            throw Error(
                `Value '${value.toString()}' of key/column: '${row.key}/${this.property}' is not defined. Allowed is ${this.allowedValues
                    .map((k) => `'${k}'`)
                    .join(' or ')}`
            );
        }
    }
}
