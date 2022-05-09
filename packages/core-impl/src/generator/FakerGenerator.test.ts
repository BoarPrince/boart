import assert from 'assert';
import { faker } from '@faker-js/faker';
import { FakeGenerator } from './FakeGenerator';

let languageChangeSubscriber: (lang: string) => void;
jest.mock('@boart/core', () => ({
    TextLanguageHandler: class {
        static instance = {
            language: {
                subscribe(next: (lang: string) => void) {
                    languageChangeSubscriber = next;
                }
            }
        };
    }
}));

describe('faker generator', () => {
    const sut = new FakeGenerator();

    /**
     *
     */
    it('check change language', () => {
        languageChangeSubscriber('fr');
        expect(faker.locale).toBe('fr');
    });

    /**
     *
     */
    it('result of datatype.number must be a number', () => {
        const fakerResult = sut.generate('datatype', 'number');
        expect(parseInt(fakerResult)).toBeGreaterThanOrEqual(0);
    });

    /**
     *
     */
    it('result of datatype.number with parameter 10-99 must have a correct value', () => {
        const fakerResult = sut.generate('datatype', 'number', 'min=10', 'max=99');
        expect(parseInt(fakerResult)).toBeGreaterThanOrEqual(10);
        expect(parseInt(fakerResult)).toBeLessThanOrEqual(99);
    });

    /**
     *
     */
    it('result of datatype.number with parameter 100-999 must have a correct value', () => {
        const fakerResult = sut.generate('datatype', 'number', 'min=100', 'max=999');
        expect(parseInt(fakerResult)).toBeGreaterThanOrEqual(100);
        expect(parseInt(fakerResult)).toBeLessThanOrEqual(999);
    });

    /**
     *
     */
    it('wrong faker call should throw an error', () => {
        try {
            sut.generate('fake', 'fake');
        } catch (error) {
            expect(error.message).toBe(`error calling faker namespace 'fake.fake', Error: Invalid method: fake.fake`);
            return;
        }

        assert.fail('error not thrown when calling a wrong faker');
    });
});
