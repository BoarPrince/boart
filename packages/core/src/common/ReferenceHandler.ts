'use strict';

import fs from 'fs';
import path from 'path';

import { TextLanguageHandler } from './TextLanguageHandler';

/**
 *
 */
export class ReferenceItem {
    readonly item: any;
    constructor(item) {
        this.item = item;
    }

    get(propertyName) {
        const lang = TextLanguageHandler.instance.defaultLanguage;
        const langPropName = `${propertyName}:${lang}`;

        if (!this.item.hasOwnProperty(propertyName) && !this.item.hasOwnProperty(langPropName)) {
            throw new Error(`item ${JSON.stringify(this.item)} does not contain a property '${propertyName}' or '${langPropName}'`);
        }

        return this.item[langPropName] || this.item[propertyName];
    }
}

/**
 *
 */
export class ReferenceHandler {
    refList: any;
    fileName: any;
    searchPath: any;

    /**
     *
     */
    constructor(fileName, searchPath = null) {
        this.refList = null;
        this.fileName = fileName;
        this.searchPath = searchPath;
    }

    /**
     *
     */
    private readFile() {
        let referenceJSONFileName = this.fileName;
        if (!this.fileName.endsWith('.json') && !!this.searchPath) {
            referenceJSONFileName =
                this.searchPath
                    .split(',')
                    .map(p => path.join(p.trim(), `${this.fileName}.json`))
                    .find(p => fs.existsSync(p)) || this.fileName;
        }

        let refFileContent;
        try {
            refFileContent = fs.readFileSync(referenceJSONFileName, 'utf8');
        } catch (error) {
            throw new Error(`cannot find file ${referenceJSONFileName}`);
        }

        try {
            return JSON.parse(refFileContent);
        } catch (error) {
            throw new Error(`file '${this.fileName}' seems not a valid json`);
        }
    }

    /**
     *
     */
    getFileName() {
        return this.fileName;
    }

    /**
     *
     */
    getRandomItem() {
        if (!this.refList) {
            this.refList = this.readFile();

            if (this.refList.length === 0) {
                throw new Error(`json file '${this.fileName}' does not contain an array structure`);
            }
        }

        const randomIndex = Math.floor(Math.random() * this.refList.length);
        return new ReferenceItem(this.refList[randomIndex]);
    }

    /**
     *
     */
    static getProperty(filename, property): string {
        const referenceItem = new ReferenceHandler(filename, process.env.reference_search_path).getRandomItem();
        return referenceItem.get(property);
    }
}
