import { Generator } from '@boart/core';

/**
 *
 */
export class CharGenerator implements Generator {
    /**
     *
     */
    readonly name = 'char';

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
    generate(paras: string[]): string {
        const para_size = paras?.[0] ?? '1';

        const size = Number.parseInt(para_size);
        if (isNaN(size) || size < 1) {
            throw Error(`char generator requires a positive number (greater 0) parameter. '${para_size}' does not fit this requirement.`);
        }

        return this.getChars(size);
    }
}
