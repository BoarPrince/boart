import { BaseRowMetaDefinition, ObjectValidator, RowValidator, ValidatorFactory } from '@boart/core';

/**
 *
 */
export class ValueRequiredValidator implements RowValidator {
    constructor(
        private readonly columnName: string,
        private readonly errorMessage?: string
    ) {}

    /**
     * F A C T O R Y
     */
    public static factory(): ValidatorFactory {
        return {
            name: 'ValueRequiredValidator',

            /**
             *
             */
            check(para: string | Array<unknown> | object): boolean {
                ObjectValidator.instance(para)
                    .notNull()
                    .onlyContainsProperties(['column'], ['errorMessge'])
                    .prop('column')
                    .shouldString()
                    .prop('errorMessage')
                    .shouldString();
                return true;
            },

            /**
             *
             */
            create(para: string | Array<unknown> | object): RowValidator {
                type ParaType = { column: string; errorMessage: string };
                const property = (para as ParaType).column;
                const errorMessage = (para as ParaType).errorMessage;
                return new ValueRequiredValidator(property, errorMessage);
            }
        };
    }

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
