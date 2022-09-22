import { Generator } from '@boart/core';
import dateFormat from 'dateformat';

/**
 *
 */
export class DateTimeGenerator implements Generator {
    /**
     *
     */
    readonly name = 'datetime.iso';

    /**
     *
     */
    private getDateTime(offset: number) {
        const date = new Date();
        date.setTime(date.getTime() + offset * 24 * 60 * 60 * 1000);
        return dateFormat(date, 'yyyy-mm-dd"T"HH:MM:ss');
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
            throw Error(`datetime generator requires a number parameter. '${para_offset}' does not fit this requirement.`);
        }

        return this.getDateTime(offset);
    }
}
