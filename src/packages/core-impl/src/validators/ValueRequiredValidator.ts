import { BaseRowMetaDefinition, RowValidator } from '@boart/core';

/**
 *
 */
export class ValueRequiredValidator implements RowValidator {
    constructor(
        private readonly columnName: string,
        private readonly errorMessage?: string
    ) {}

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(row: BaseRowMetaDefinition<any, any>) {
        if (!Object.keys(row.values_replaced).some((key) => key === this.columnName)) {
            throw Error(`Validator: '${this.constructor.name}' => column '${this.columnName}' is not defined`);
        }

        if (!row.values_replaced[this.columnName]) {
            throw Error(
                `${row._metaDefinition.key.description.toString()}:` +
                    (!this.errorMessage ? ` missing value for column '${this.columnName}'` : this.errorMessage)
            );
        }
    }
}
