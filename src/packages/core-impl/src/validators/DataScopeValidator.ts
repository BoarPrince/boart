import { BaseRowMetaDefinition, ObjectValidator, RowValidator, ValidatorFactory } from '@boart/core';

/**
 * allowd datascopes can also be null or empty string if no parameter is possible
 */
export class DataScopeValidator implements RowValidator {
    constructor(private readonly allowedDataScope: readonly string[] = ['']) {}

    /**
     * F A C T O R Y
     */
    public static factory(): ValidatorFactory {
        return {
            name: 'DataScopeValidator',

            /**
             *
             */
            check(para: string | Array<string> | object): boolean {
                ObjectValidator.instance(para).notNull().shouldArray('string');
                return true;
            },

            /**
             *
             */
            create(para: string | Array<string> | Map<string, string>): RowValidator {
                return new DataScopeValidator(para as Array<string>);
            }
        };
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(row: BaseRowMetaDefinition<any, any>) {
        if (!!row.ast.datascope && !this.allowedDataScope.some((allowedPara) => row.ast.datascope.value === allowedPara)) {
            throw Error(
                `Datascope '${row.ast.datascope?.value}' of action '${
                    row.ast.name.stringValue
                }' is not defined. Allowed is ${this.allowedDataScope.map((k) => `'${k}'`).join('\n or ')}`
            );
        }
    }
}
