import assert from 'assert';
import { TimestampGenerator } from './TimestampGenerator';

describe('check timestamp generator', () => {
    const sut = new TimestampGenerator();

    it('check generated timestamp length', () => {
        const timestamp = sut.generate();
        expect(timestamp).not.toBeNull();
        expect(timestamp).toBeDefined();
        expect(timestamp.length).toBeGreaterThanOrEqual(17);
        expect(timestamp.length).toBeLessThanOrEqual(18);
    });

    it('parameters shall not be defined', () => {
        try {
            sut.generate('para1');
        } catch (error) {
            expect(error.message).toBe(`parameter 'para1' cannot be defined for timestamp generator`);
            return;
        }

        assert.fail('exception was not thrown but a parameter was defined');
    });
});
