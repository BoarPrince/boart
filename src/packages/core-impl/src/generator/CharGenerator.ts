import { Generator } from '@boart/core';

/**
 *
 */
export class CharGenerator implements Generator {
    /**
     *
     */
    readonly name = 'CharGenerator';

    /**
     *
     */
    private getChars(size: number): string {
        const code = new Array<number>();
        for (let n = 0; n < size; n++) {
            code.push(Math.floor(Math.random() * 25) + 65);
        }

        return String.fromCharCode(...code);
    }

    /**
     *
     */
    generate(para_size: string): string {
        if (!para_size) {
            para_size = '1'; // default
        }

        const size = Number.parseInt(para_size);
        if (isNaN(size) || size < 1) {
            throw Error(`char generator requires a positive number (greater 0) parameter. '${para_size}' does not fit this requirement.`);
        }

        return this.getChars(size);
    }
}
