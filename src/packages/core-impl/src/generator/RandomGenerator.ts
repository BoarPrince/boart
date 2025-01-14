import { Generator } from '@boart/core';

/**
 *
 */
export class RandomGenerator implements Generator {
    /**
     *
     */
    readonly name = 'random';

    /**
     *
     */
    private getRandom(size: number): string {
        const random = [];
        for (let n = 0; n < size; n++) {
            random.push(Math.floor(Math.random() * 10));
        }
        return random.join('');
    }

    /**
     *
     */
    generate(paras: string[]): string {
        const para_size = paras?.[0] ?? '4';

        const count = Number.parseInt(para_size);

        if (isNaN(count) || count < 1) {
            throw Error(`random generator requires a positive number (greater 0) parameter. '${para_size}' does not fit this requirement.`);
        }

        return this.getRandom(count);
    }
}
