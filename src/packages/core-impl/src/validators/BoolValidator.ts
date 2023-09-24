import { BaseRowMetaDefinition, RowValidator } from '@boart/core';

/**
 *
 */
export class BoolValidator implements RowValidator {
    constructor(private readonly columnName: string) {}

    /**
     *
     */
    private static lowercase(value: string | boolean | number): string | boolean | number {
        if (typeof value === 'string') {
            return value.toLowerCase();
        }
        return value;
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(row: BaseRowMetaDefinition<any, any>) {
        if (!Object.keys(row.values_replaced).some((key) => key === this.columnName)) {
            throw Error(`Validator: '${this.constructor.name}' => column '${this.columnName}' is not defined`);
        }

        const value = BoolValidator.lowercase(row.values_replaced[this.columnName]);
        if (value !== 'true' && value !== 'false' && typeof value !== 'boolean') {
            throw Error(`column '${this.columnName}' must be a boolean value, but is '${value}'`);
        }

        row.values_replaced[this.columnName] = value == 'true' || value === true;
        row.values_replaced[this.columnName] = row.values_replaced[this.columnName];
    }
}
