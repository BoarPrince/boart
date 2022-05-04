import { BaseRowMetaDefinition } from '../BaseRowMetaDefinition';

import { RowValidator } from './RowValidator';

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
        if (!this.allowedPara.some(allowedPara => row.keyPara === allowedPara || (!allowedPara && !row.keyPara))) {
            throw Error(`Parameter '${row.keyPara}' is not defined`);
        }
    }
}
