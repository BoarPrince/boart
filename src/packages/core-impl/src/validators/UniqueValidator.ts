import { BaseRowMetaDefinition, RowValidator, ValidatorFactory, ValidatorType } from '@boart/core';

/**
 * Key can only used once a time
 */
export class UniqueValidator implements RowValidator {
    /**
     * F A C T O R Y
     */
    public static factory(): ValidatorFactory {
        return {
            name: 'UniqueValidator',
            type: ValidatorType.ROW,

            /**
             *
             */
            check(para: string | Array<unknown> | object): boolean {
                return para == null;
            },

            /**
             *
             */
            create(): RowValidator {
                return new UniqueValidator();
            }
        };
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(row: BaseRowMetaDefinition<any, any>, rows: readonly BaseRowMetaDefinition<any, any>[]) {
        const keyCount = rows.reduce((count, r) => {
            return r.ast.name.stringValue === row.ast.name.stringValue ? count + 1 : count;
        }, 0);
        if (keyCount > 1) {
            throw Error(`Validator: '${this.constructor.name}' => key '${row.ast.name.stringValue}' occurs ${keyCount} times`);
        }
    }
}
