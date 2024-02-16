import { BaseRowMetaDefinition, ObjectValidator, RowValidator, ValidatorFactory, ValidatorType } from '@boart/core';

/**
 *
 */
export class IntValidator implements RowValidator {
    constructor(
        private readonly columnName: string,
        private readonly allowNull = false
    ) {}

    /**
     * F A C T O R Y
     */
    public static factory(): ValidatorFactory {
        return {
            name: 'IntValidator',
            type: ValidatorType.ROW,

            /**
             *
             */
            check(para: string | Array<unknown> | object): boolean {
                ObjectValidator.instance(para)
                    .notNull()
                    .shouldArray()
                    .onlyContainsProperties(['column', 'allowNull'])
                    .prop('column')
                    .shouldString()
                    .prop('allowNull')
                    .shouldBoolean();
                return true;
            },

            /**
             *
             */
            create(para: string | Array<unknown> | object): RowValidator {
                type ParaType = { column: string; allowNull: boolean };
                const columnName = (para as ParaType).column;
                const allowNull = (para as ParaType).allowNull;

                return new IntValidator(columnName, allowNull);
            }
        };
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(row: BaseRowMetaDefinition<any, any>): void {
        if (!Object.keys(row.values_replaced).some((key) => key === this.columnName)) {
            throw Error(`Validator: '${this.constructor.name}' => column '${this.columnName}' is not defined`);
        }

        const value = row.values_replaced[this.columnName];
        if (value == null && this.allowNull) {
            return;
        } else {
            const re = /^\d+$/;
            if (!re.test(String(value))) {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                throw Error(`column '${this.columnName}' must be a integer (number) value, but is '${value}'`);
            }

            const inVal = Number.parseInt(value as string);
            row.values_replaced[this.columnName] = inVal;
        }
    }
}
