import assert from 'assert';
import fs from 'fs';
import fsPath from 'path';

import { Observable, Subject } from 'rxjs';

import { ArraySubject } from './ArraySubject';

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
    private readonly _language: Subject<string>;
    private static _instance: TextLanguageHandler;

    /**
     *
     */
    private constructor() {
        this.mappings = {};
        this._defaultLanguage = '';
        this._language = new ArraySubject<string>();
    }

    /**
     *
     */
    static get instance(): TextLanguageHandler {
        if (!TextLanguageHandler._instance) {
            TextLanguageHandler._instance = new TextLanguageHandler();
            TextLanguageHandler._instance.readMapping();
        }
        return TextLanguageHandler._instance;
    }

    /**
     *
     */
    add(identifier: string) {
        if (!!this.mappings[identifier]) {
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
        this._language.next(language);
    }

    /**
     *
     */
    get language(): Observable<string> {
        return this._language;
    }

    /**
     *
     */
    private readSettings(filename: string): TextMappingSettings {
        try {
            console.info(`language handler: load env file ${filename}`);
            const fileData = fs.readFileSync(filename, 'utf8');
            const settings = JSON.parse(fileData) as EnvironmentSettings;
            return settings.text_mapping;
        } catch (error) {
            console.log(error);
            assert.fail(`can't read language settings from env [${filename}]: ${JSON.stringify(error)}`);
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

        mappings.forEach(entry => {
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
        this.initMapping(this.readSettings(fsPath.join(process.env.GAUGE_PROJECT_ROOT, process.env.environment_project_location)));
    }
}
