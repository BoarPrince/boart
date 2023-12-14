import { BaseRowMetaDefinition, RowValidator } from '@boart/core';

/**
 * allowd datascopes can also be null or empty string if no parameter is possible
 */
export class DataScopeValidator implements RowValidator {
    constructor(private readonly allowedDataScope: readonly string[] = ['']) {}

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
