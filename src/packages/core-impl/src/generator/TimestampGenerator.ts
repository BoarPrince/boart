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
    generate(para?: string): string {
        if (!!para) {
            throw Error(`parameter '${para}' cannot be defined for timestamp generator`);
        }
        return `${dateFormat(new Date(), 'yyyymmddhhMMssms')}${TimestampGenerator.timeStampPostIdent++}`;
    }
}
