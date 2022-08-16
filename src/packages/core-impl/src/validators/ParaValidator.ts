import { BaseRowMetaDefinition, RowValidator } from '@boart/core';

/**
 *
 */
export class ParaValidator implements RowValidator {
    constructor(private readonly allowedPara: readonly string[]) {}

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(row: BaseRowMetaDefinition<any, any>) {
        if (!!row.keyPara && !this.allowedPara.some((allowedPara) => row.keyPara === allowedPara || (!allowedPara && !row.keyPara))) {
            throw Error(
                `Parameter '${row.keyPara}' of key '${row.key}' is not defined. Allowed is ${this.allowedPara
                    .map((k) => `'${k}'`)
                    .join(' or ')}`
            );
        }
    }
}
