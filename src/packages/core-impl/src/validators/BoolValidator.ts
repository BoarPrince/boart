import { BaseRowMetaDefinition, ObjectValidator, RowValidator, ValidatorFactory } from '@boart/core';

/**
 *
 */
export class BoolValidator implements RowValidator {
    constructor(private readonly columnName: string) {}

    /**
     * F A C T O R Y
     */
    public static factory(): ValidatorFactory {
        return {
            name: 'BoolValidator',

            /**
             *
             */
            check(para: string | Array<string> | object): boolean {
                ObjectValidator.instance(para).notNull().shouldString();
                return true;
            },

            /**
             *
             */
            create(para: string | Array<string> | object): RowValidator {
                return new BoolValidator(para as string);
            }
        };
    }

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
    }
}
