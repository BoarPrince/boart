import fs from 'fs';

import { EnvironmentSettings, TextLanguageHandler } from './TextLanguageHandler';
import { Runtime } from '../runtime/Runtime';

jest.mock('fs');

/**
 *
 */
const mockData: EnvironmentSettings = {
    text_mapping: {
        default_language: 'nl',
        mappings: [{ de: 'hallo', en: 'hello', ident: 'hello' }]
    }
};

/**
 *
 */
describe('check text language handler', () => {
    /**
     *
     */
    beforeEach(() => {
        (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockData));
        process.env.environment_project_root = '<root>';
        process.env.environment_project_location = 'env';
    });

    /**
     *
     */
    afterEach(() => {
        (fs.readFileSync as jest.Mock).mockClear();
    });

    /**
     *
     */
    describe('check handling', () => {
        /**
         *
         */
        it('check initialization', () => {
            const sut = TextLanguageHandler.instance;

            expect(fs.readFileSync).toHaveBeenCalledWith('<root>/env', 'utf8');
            expect(sut.defaultLanguage).toBe('nl');
        });

        /**
         *
         */
        it('add identifier mulitple times', () => {
            const sut = TextLanguageHandler.instance;

            expect(() => sut.add('hello')).toThrow(`language mapping for 'hello' is already defined!`);
        });

        /**
         *
         */
        it('request existing translation', () => {
            const sut = TextLanguageHandler.instance;
            sut.defaultLanguage = 'en';

            const text = sut.get('hello');

            expect(text).toBe('hello');
        });

        /**
         *
         */
        it('request unkown translation language', () => {
            const sut = TextLanguageHandler.instance;
            sut.defaultLanguage = 'en';

            expect(() => sut.get('hello', 'nl')).toThrow(`no language defined for 'hello', langauge='nl'`);
        });

        /**
         *
         */
        it('request unkown translation', () => {
            const sut = TextLanguageHandler.instance;
            sut.defaultLanguage = 'en';

            expect(() => sut.get('hello2')).toThrow(`no text entry defined for hello2`);
        });
    });

    /**
     *
     */
    describe('check initialization', () => {
        /**
         *
         */
        beforeEach(() => {
            delete globalThis.globalThis._textLanguageHandlerInstance;
        });

        /**
         *
         */
        it('check setting default language', () => {
            const expectedResult = ['nl', 'en'];

            // eslint-disable-next-line jest/no-test-return-statement
            return new Promise<void>((done) => {
                Runtime.instance.language.subscribe((lang) => {
                    const found = expectedResult.shift();
                    expect(found).toBe(lang);

                    if (expectedResult.length === 0) {
                        done();
                    }
                });

                TextLanguageHandler.instance.defaultLanguage = 'en';
            });
        });

        /**
         *
         */
        it('check if textmapping cant be read', () => {
            (fs.readFileSync as jest.Mock).mockReturnValue(null);

            let sut: TextLanguageHandler;
            try {
                sut = TextLanguageHandler.instance;
            } catch (error) {
                expect(error.message).toBe(`can't read language settings from env [<root>/env]: {}`);
                expect(sut).toBeUndefined();
                return;
            }

            fail('error must be thrown if language setting cant be read');
        });

        /**
         *
         */
        it('check if textmapping is empty', () => {
            (fs.readFileSync as jest.Mock).mockReturnValue(
                JSON.stringify({
                    text_mapping: null
                })
            );

            const sut = TextLanguageHandler.instance;
            expect(sut).toBeDefined();
        });

        /**
         *
         */
        it('check if default language is not defined', () => {
            (fs.readFileSync as jest.Mock).mockReturnValue(
                JSON.stringify({
                    text_mapping: {
                        mappings: [{ de: 'hallo', en: 'hello', ident: 'hello' }]
                    }
                } as EnvironmentSettings)
            );

            const sut = TextLanguageHandler.instance;
            expect(sut.defaultLanguage).toBe('en');
        });

        /**
         *
         */
        it('check if mapping is not defined', () => {
            (fs.readFileSync as jest.Mock).mockReturnValue(
                JSON.stringify({
                    text_mapping: {
                        default_language: 'nl'
                    }
                } as EnvironmentSettings)
            );

            const sut = TextLanguageHandler.instance;
            expect(sut.defaultLanguage).toBe('nl');
        });

        /**
         *
         */
        it(`check if 'property' ident is not defined`, () => {
            (fs.readFileSync as jest.Mock).mockReturnValue(
                JSON.stringify({
                    text_mapping: {
                        default_language: 'fr',
                        mappings: [{ de: 'hallo', en: 'hello', iden: 'hello' }]
                    }
                } as EnvironmentSettings)
            );

            expect(() => TextLanguageHandler.instance).toThrow(
                `identifier {"de":"hallo","en":"hello","iden":"hello"} not defined in mapping`
            );
        });

        /**
         *
         */
        it(`check if language is defined in iso2 format`, () => {
            (fs.readFileSync as jest.Mock).mockReturnValue(
                JSON.stringify({
                    text_mapping: {
                        default_language: 'en',
                        mappings: [{ deu: 'hallo', eng: 'hello', ident: 'hello' }]
                    }
                } as EnvironmentSettings)
            );

            let sut: TextLanguageHandler;
            try {
                sut = TextLanguageHandler.instance;
            } catch (error) {
                expect(error.message).toBe(`only iso2 language definition is allowed for 'hello', but it's 'deu'`);
                expect(sut).toBeUndefined();
                return;
            }

            fail('error must be thrown if the language is not defined in iso2 format');
        });
    });
});
