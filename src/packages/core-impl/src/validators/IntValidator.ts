import { BaseRowMetaDefinition, RowValidator } from '@boart/core';

/**
 *
 */
export class IntValidator implements RowValidator {
    constructor(private readonly columnName: string, private readonly allowNull = false) {}

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(row: BaseRowMetaDefinition<any, any>) {
        if (!Object.keys(row.values).some((key) => key === this.columnName)) {
            throw Error(`Validator: '${this.constructor.name}' => column '${this.columnName}' is not defined`);
        }

        const value = row.values[this.columnName];
        if (value == null && this.allowNull) {
            return;
        } else {
            const re = /^\d+$/;
            if (!re.test(String(value))) {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                throw Error(`column '${this.columnName}' must be a integer (number) value, but is '${value}'`);
            }

            const inVal = Number.parseInt(value as string);
            row.values[this.columnName] = inVal;
            row.values_replaced[this.columnName] = inVal;
        }
    }
}
