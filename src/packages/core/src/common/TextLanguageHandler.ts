import fs from 'fs';
import fsPath from 'path';

import { Runtime } from '../runtime/Runtime';

/**
 *
 */
interface TextMappingSettings {
    readonly default_language?: string;
    readonly mappings?: ReadonlyArray<Record<string, string>>;
}

/**
 *
 */
export interface EnvironmentSettings {
    readonly text_mapping: TextMappingSettings;
}

/**
 *
 */
class MappingEntry {
    readonly _ident: string;
    readonly _values: Record<string, string>;
    /**
     *
     */
    constructor(ident: string) {
        this._ident = ident;
        this._values = {};
    }

    /**
     *
     */
    add(value: string, language: string) {
        this._values[language] = value;
        return this;
    }

    /**
     *
     */
    get(language: string) {
        const value = this._values[language];
        if (!value) {
            throw Error(`no language defined for '${this._ident}', langauge='${language}'`);
        }
        return value;
    }
}

/**
 *
 */
export class TextLanguageHandler {
    private readonly mappings: Record<string, MappingEntry>;
    private _defaultLanguage: string;

    /**
     *
     */
    private constructor() {
        this.mappings = {};
        this._defaultLanguage = '';
    }

    /**
     *
     */
    static get instance(): TextLanguageHandler {
        if (!globalThis._textLanguageHandlerInstance) {
            const instance = new TextLanguageHandler();
            globalThis._textLanguageHandlerInstance = instance;
            globalThis._textLanguageHandlerInstance.readMapping();
        }
        return globalThis._textLanguageHandlerInstance;
    }

    /**
     *
     */
    add(identifier: string) {
        if (this.mappings[identifier]) {
            throw Error(`language mapping for '${identifier}' is already defined!`);
        }
        const entry = new MappingEntry(identifier);
        this.mappings[identifier] = entry;
        return entry;
    }

    /**
     *
     */
    get(identifier: string, language = this.defaultLanguage): string {
        const entry = this.mappings[identifier];
        if (!entry) {
            throw Error(`no text entry defined for ${identifier}`);
        }
        return entry.get(language);
    }

    /**
     *
     */
    get defaultLanguage(): string {
        return this._defaultLanguage;
    }

    /**
     *
     */
    set defaultLanguage(language: string) {
        this._defaultLanguage = language;
        Runtime.instance.language.next(language);
    }

    /**
     *
     */
    private readSettings(filename: string): TextMappingSettings {
        try {
            console.info(`language handler: load env file ${filename}`);
            const fileData: string = fs.readFileSync(filename, 'utf8');
            const settings = JSON.parse(fileData) as EnvironmentSettings;
            return settings.text_mapping;
        } catch (error) {
            throw Error(`can't read language settings from env [${filename}]: ${JSON.stringify(error)}`);
        }
    }

    /**
     *
     */
    private initMapping(settings: TextMappingSettings) {
        if (!settings) {
            return;
        }

        if (!this._defaultLanguage) {
            this.defaultLanguage = settings.default_language || 'en';
        }

        const mappings = settings.mappings;
        if (!mappings) {
            return;
        }

        mappings.forEach((entry) => {
            const ident = entry['ident'];
            if (!ident) {
                throw new Error(`identifier ${JSON.stringify(entry)} not defined in mapping`);
            }
            const mappingEntry = this.add(ident);

            Object.entries(entry)
                .filter(([key]) => key != 'ident')
                .forEach(([lang, value]) => {
                    if (lang.length > 2) {
                        throw new Error(`only iso2 language definition is allowed for '${ident}', but it's '${lang}'`);
                    }
                    mappingEntry.add(value, lang);
                });
        });
    }

    /**
     *
     */
    private readMapping() {
        this.initMapping(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
            this.readSettings(fsPath.join(process.env.environment_project_root || '', process.env.environment_project_location || ''))
        );
    }
}
