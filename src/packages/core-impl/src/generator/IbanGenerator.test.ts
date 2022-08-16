import assert from 'assert';

import IBAN from 'iban';

import { IbanGenerator } from './IbanGenerator';

describe('check IBAN Generator', () => {
    const sut = new IbanGenerator();

    it('check generated iban length', () => {
        const iban = sut.generate();
        expect(iban).not.toBeNull();
        expect(iban).toBeDefined();
        expect(iban.length).toBe(22);
    });

    it('check generation with iban validator', () => {
        for (let i = 0; i < 100; i++) {
            const iban = sut.generate();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            expect(IBAN.isValid(iban)).toBeTruthy();
        }
    });

    it('parameters shall not be defined', () => {
        try {
            sut.generate('para1');
        } catch (error) {
            expect(error.message).toBe(`parameter 'para1' cannot be defined for iban generator`);
            return;
        }

        assert.fail('exception was not thrown but a parameter was defined');
    });
});
