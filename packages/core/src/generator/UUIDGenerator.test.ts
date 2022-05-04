import assert from 'assert';
import { UUIDGenerator } from './UUIDGenerator';

describe('check UUIDGenerator', () => {
    const sut = new UUIDGenerator();

    it('check correct uuid generation', () => {
        const uuid = sut.generate();
        expect(uuid).not.toBeNull();
        expect(uuid).toBeDefined();
        expect(uuid.length).toBe(36);
        expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('parameters shall not be defined', () => {
        try {
            sut.generate('para1');
        } catch (error) {
            expect(error.message).toBe(`paramter 'para1' cannot be defined for uuid generator`);
            return;
        }

        assert.fail('exception was not thrown but a parameter was defined');
    });
});
