import { Generator } from '@boart/core';
import dateFormat from 'dateformat';

/**
 *
 */
export class ISODateGenerator implements Generator {
    /**
     *
     */
    readonly name = 'date.iso';

    /**
     *
     */
    private getISODate(offset: number) {
        const date = new Date();
        date.setTime(date.getTime() + offset * 24 * 60 * 60 * 1000);
        return dateFormat(date, 'yyyy-mm-dd');
    }

    /**
     *
     */
    generate(paras: string[]): string {
        const para_offset = paras?.[0] ?? '0';

        const offset = Number.parseInt(para_offset);
        if (isNaN(offset)) {
            throw Error(`iso date generator requires a number parameter. '${para_offset}' does not fit this requirement.`);
        }

        return this.getISODate(offset);
    }
}
