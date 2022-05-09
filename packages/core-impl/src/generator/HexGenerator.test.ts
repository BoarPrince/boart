import assert from 'assert';
import { HexGenerator } from './HexGenerator';

describe('hex generator', () => {
    const sut = new HexGenerator();

    it('hex generator (size=1)', () => {
        const random = sut.generate('1');
        expect(random).toBeDefined();
        expect(random.length).toBe(1);
    });

    it('hex generator (size=2)', () => {
        const random = sut.generate('2');
        expect(random).toBeDefined();
        expect(random.length).toBe(2);
    });

    it('hex generator (size=1000)', () => {
        const random = sut.generate('1000');
        expect(random).toBeDefined();
        expect(random).toMatch(/^[a-z0-9]{1000}$/);
    });

    it('default with no parameter must have 1 characters', () => {
        const random = sut.generate(null);
        expect(random).toBeDefined();
        expect(random.length).toBe(1);
    });

    it('parameter must be greater than 0', () => {
        try {
            sut.generate('0');
        } catch (error) {
            expect(error.message).toBe(
                `hex generator requires a positive number (greater 0) parameter. '0' does not fit this requirement.`
            );
            return;
        }

        assert.fail('if parameter is not a number an error must thrown');
    });

    it('parameter must be a number', () => {
        try {
            sut.generate('not a number');
        } catch (error) {
            expect(error.message).toBe(
                `hex generator requires a positive number (greater 0) parameter. 'not a number' does not fit this requirement.`
            );
            return;
        }

        assert.fail('if parameter is not a number an error must thrown');
    });
});
