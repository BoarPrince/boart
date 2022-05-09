import { BaseRowMetaDefinition, RowValidator } from '@boart/core';

/**
 *
 */
export class IntValidator implements RowValidator {
    constructor(private readonly columnName: string) {}

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(row: BaseRowMetaDefinition<any, any>) {
        if (!Object.keys(row.values).some((key) => key === this.columnName)) {
            throw Error(`Validator: '${this.constructor.name}' => column '${this.columnName}' is not defined`);
        }

        const value = row.values[this.columnName];
        const re = /^\d+$/;
        if (!re.test(String(value))) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            throw Error(`column '${this.columnName}' must be a integer (number) value, but is '${value}'`);
        }

        row.values[this.columnName] = Number.parseInt(value as string);
        row.values_replaced[this.columnName] = row.values[this.columnName];
    }
}
