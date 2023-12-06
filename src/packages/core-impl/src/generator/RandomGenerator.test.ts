import assert from 'assert';

import { RandomGenerator } from './RandomGenerator';

describe('check random generator', () => {
    const sut = new RandomGenerator();

    it('check random generator (size=1)', () => {
        const random = sut.generate(['1']);
        expect(random).toBeDefined();
        expect(random.length).toBe(1);
    });

    it('check random generator (size=2)', () => {
        const random = sut.generate(['2']);
        expect(random).toBeDefined();
        expect(random.length).toBe(2);
    });

    it('check random generator (size=1000)', () => {
        const random = sut.generate(['1000']);
        expect(random).toBeDefined();
        expect(random).toMatch(/^[0-9]{1000}$/);
    });

    it('default with no parameter must have 4 digits', () => {
        const random = sut.generate(null);
        expect(random).toBeDefined();
        expect(random.length).toBe(4);
    });

    it('negative size is not allowed', () => {
        try {
            sut.generate(['-1']);
        } catch (error) {
            expect(error.message).toBe(
                `random generator requires a positive number (greater 0) parameter. '-1' does not fit this requirement.`
            );
            return;
        }

        assert.fail('if parameter is not a number or less than 1 an error must thrown');
    });

    it('parameter must be a number', () => {
        try {
            sut.generate(['not a number']);
        } catch (error) {
            expect(error.message).toBe(
                `random generator requires a positive number (greater 0) parameter. 'not a number' does not fit this requirement.`
            );
            return;
        }

        assert.fail('if parameter is not a number or less than 1 an error must thrown');
    });
});
