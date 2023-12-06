import { TimestampGenerator } from './TimestampGenerator';

/**
 *
 */
describe('check timestamp generator', () => {
    const sut = new TimestampGenerator();

    it('check generated timestamp length', () => {
        const timestamp = sut.generate(null);
        expect(timestamp).not.toBeNull();
        expect(timestamp).toBeDefined();
        expect(timestamp.length).toBeGreaterThanOrEqual(17);
        expect(timestamp.length).toBeLessThanOrEqual(19);
    });

    it('parameters shall not be defined', () => {
        expect(() => sut.generate(['para1'])).toThrow(`parameter 'para1' cannot be defined for timestamp generator`);
    });
});
