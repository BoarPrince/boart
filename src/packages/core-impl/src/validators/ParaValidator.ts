import { BaseRowMetaDefinition, RowValidator } from '@boart/core';

/**
 * allowd paras can also be null if no parameter is possible too.
 */
export class ParaValidator implements RowValidator {
    constructor(private readonly allowedPara: readonly string[]) {}

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(row: BaseRowMetaDefinition<any, any>) {
        if (
            !!row.ast.qualifier &&
            !this.allowedPara.some(
                // (allowedPara) => row.ast.qualifier.paras?.[0] === allowedPara || (!allowedPara && !row.ast.qualifier.paras?.length)
                (allowedPara) =>
                    row.ast.qualifier.stringValue === allowedPara ||
                    row.ast.qualifier.paras?.[0] === allowedPara ||
                    (!allowedPara && !row.ast.qualifier.paras?.length)
            )
        ) {
            throw Error(
                `Parameter '${row.ast.qualifier?.paras?.join(':')}' of key '${
                    row.ast.name.stringValue
                }' is not defined. Allowed is ${this.allowedPara.map((k) => `'${k}'`).join('\n or ')}`
            );
        }
    }
}
