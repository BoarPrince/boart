import { Generator } from './Generator';

const dateFormat = require('dateformat');

/**
 *
 */
export class ISODateGenerator implements Generator {
    /**
     *
     */
    readonly name = 'ISODateGenerator';

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
    generate(para_offset?: string): string {
        if (!para_offset) {
            para_offset = '0'; // default
        }

        const offset = Number.parseInt(para_offset);
        if (isNaN(offset)) {
            throw Error(`iso date generator requires a number parameter. '${para_offset}' does not fit this requirement.`);
        }

        return this.getISODate(offset);
    }
}
