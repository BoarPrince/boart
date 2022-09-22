import { Generator } from '@boart/core';

/**
 *
 */
export class IbanGenerator implements Generator {
    /**
     *
     */
    readonly name = 'iban';

    /**
     *
     */
    private getGermanIBAN(): string {
        let iban: string;
        let pruef: number;

        const ktnr = Math.round(Math.random() * 8999999) + 1000000;
        pruef = ktnr * 1000000 + 43;
        const pruef2 = pruef % 97;
        pruef = 98 - pruef2;

        if (pruef > 9) {
            iban = 'DE';
        } else {
            iban = 'DE0';
        }

        iban = `${iban}${pruef}70050000000${ktnr}`;
        return iban;
    }

    /**
     *
     */
    generate(para?: string): string {
        if (!!para) {
            throw Error(`parameter '${para}' cannot be defined for iban generator`);
        }

        return this.getGermanIBAN();
    }
}
