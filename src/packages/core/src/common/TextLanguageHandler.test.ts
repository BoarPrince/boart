import fs from 'fs';

import { EnvironmentSettings, TextLanguageHandler } from './TextLanguageHandler';

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
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockData));
    process.env.environment_project_root = '<root>';
    process.env.environment_project_location = 'env';

    /**
     *
     */
    describe('check handling', () => {
        /**
         *
         */
        it('check initialization', () => {
            const sut = TextLanguageHandler.instance;

            expect(fs.readFileSync).toBeCalledWith('<root>/env', 'utf8');
            expect(sut.defaultLanguage).toBe('nl');
        });

        /**
         *
         */
        it('add identifier mulitple times', () => {
            const sut = TextLanguageHandler.instance;

            try {
                sut.add('hello');
            } catch (error) {
                expect(error.message).toBe(`language mapping for 'hello' is already defined!`);
                return;
            }

            fail('error must be thrown if an identifier is added multiple times');
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

            try {
                sut.get('hello', 'nl');
            } catch (error) {
                expect(error.message).toBe(`no language defined for 'hello', langauge='nl'`);
                return;
            }

            fail('error must be thrown if a language does not exist for the requested identifier');
        });

        /**
         *
         */
        it('request unkown translation', () => {
            const sut = TextLanguageHandler.instance;
            sut.defaultLanguage = 'en';

            try {
                sut.get('hello2');
            } catch (error) {
                expect(error.message).toBe(`no text entry defined for hello2`);
                return;
            }

            fail('error must be thrown if an unknown identifier is requested');
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (TextLanguageHandler as any)._instance = null;
        });

        /**
         *
         */
        it('check setting default language', (done) => {
            let i = 0;
            const expectedResult = ['nl', 'en'];
            const sut = TextLanguageHandler.instance;
            sut.language.subscribe((lang) => {
                expect(lang).toBe(expectedResult[i++]);
                if (i === 2) {
                    done();
                }
            });
            sut.defaultLanguage = 'en';
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

            let sut: TextLanguageHandler;
            try {
                sut = TextLanguageHandler.instance;
            } catch (error) {
                expect(error.message).toBe(`identifier {"de":"hallo","en":"hello","iden":"hello"} not defined in mapping`);
                expect(sut).toBeUndefined();
                return;
            }

            fail('error must be thrown if the ident property is missing in one entry');
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
