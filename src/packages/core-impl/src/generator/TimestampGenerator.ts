import { Generator } from '@boart/core';
import dateFormat from 'dateformat';

/**
 *
 */
export class TimestampGenerator implements Generator {
    private static timeStampPostIdent = 0;

    /**
     *
     */
    readonly name = 'timestamp';

    /**
     *
     */
    generate(paras: string[]): string {
        if (paras?.length > 0) {
            throw Error(`parameter '${paras.join(',')}' cannot be defined for timestamp generator`);
        }
        return `${dateFormat(new Date(), 'yyyymmddhhMMssms')}${TimestampGenerator.timeStampPostIdent++}`;
    }
}
