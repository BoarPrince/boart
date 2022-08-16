import { Generator } from '@boart/core';

/**
 *
 */
export class HexGenerator implements Generator {
    /**
     *
     */
    readonly name = 'HexGenerator';

    /**
     *
     */
    private getHex(size: number): string {
        const result = [];
        const hexRef = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

        for (let n = 0; n < size; n++) {
            result.push(hexRef[Math.floor(Math.random() * 16)]);
        }
        return result.join('');
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
            throw Error(`hex generator requires a positive number (greater 0) parameter. '${para_size}' does not fit this requirement.`);
        }

        return this.getHex(size);
    }
}
