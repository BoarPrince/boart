import { ContentInstance } from './ContentInstance';
import { ContentType } from './ContentType';
import { DataContent } from './DataContent';
import { DataContentObject } from './DataContentObject';
import { NativeContent } from './NativeContent';
import { NullContent } from './NullContent';
import { ObjectContent } from './ObjectContent';
import { TextContent } from './TextContent';

/**
 *
 */
export class DataContentHelper {
    /**
     *
     */
    static tryParse(content: string, failedContent = null): object {
        try {
            return JSON.parse(content);
        } catch (error) {
            return failedContent;
        }
    }

    /**
     *
     */
    static fromJSON(json: string): DataContent {
        const parsedJSON = DataContentHelper.tryParse(json);
        if (!parsedJSON) {
            // not possible to parse
            return null;
        }

        const generator = (obj: unknown) => {
            if (!obj) {
                return new NativeContent(obj);
            } else if (typeof obj === 'string') {
                return new TextContent(obj);
            } else if (typeof obj == 'boolean') {
                return new NativeContent(obj);
            } else if (typeof obj == 'number') {
                return new NativeContent(obj);
            }

            const map = new ObjectContent();
            Object.entries(obj).forEach(([pName, pValue]) => {
                map.set(pName, generator(pValue));
            });
            return map;
        };

        return generator(parsedJSON);
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static isContent(variable: any): boolean {
        return !!variable && !!variable.getValue;
    }

    /**
     *
     */
    static isString(variable: ContentType): boolean {
        return Object.prototype.toString.call(variable) === '[object String]';
    }
    /**
     *
     */
    public static isObject(variable: ContentType): boolean {
        if (!DataContentHelper.isContent(variable)) {
            return false;
        }

        const contentVariable = variable as DataContent;
        if (typeof contentVariable.isObject !== 'function') {
            return false;
        }

        return contentVariable.isObject();
    }

    /**
     *
     */
    static create(text_or_array: ContentType = {}): DataContent {
        /**
         *
         */
        const internalCreate = (value: ContentType): DataContent => {
            if (value === null) {
                return new NullContent();
            } else if (DataContentHelper.isContent(value)) {
                return value as DataContent;
            } else if (typeof value === 'string') {
                return DataContentHelper.fromJSON(value) ?? new TextContent(value);
            } else if (!!value && typeof value === 'object') {
                return new ObjectContent(value);
            } else {
                return new NativeContent(value);
            }
        };
        if (Array.isArray(text_or_array)) {
            return new ObjectContent(text_or_array);
        } else {
            return internalCreate(text_or_array);
        }
    }

    /**
     *
     */
    private static getPathValue(property: string, value: ContentType, completePath: string) {
        const dataContent = (value as DataContent).asDataContentObject ? (value as DataContent).asDataContentObject() : null;
        if (!dataContent) {
            if (!Object.keys(value).includes(property)) {
                DataContentHelper.throwRecursiveError(completePath, property);
            } else {
                return value[property];
            }
        } else {
            if (!dataContent.has(property)) {
                DataContentHelper.throwRecursiveError(completePath, property);
            } else {
                return dataContent.get(property);
            }
        }
    }

    /**
     *
     */
    private static throwRecursiveError(property: string, current: string) {
        throw Error(`getting "${property}" not possible, because "${current}" is not an object or an array`);
    }

    /**
     *
     */
    public static getByPath(key: string | string[], content: DataContent): DataContent {
        const keys = Array.isArray(key) ? key : DataContentHelper.splitKeys(key);
        const completePath = keys.join('.');
        const firstKey = keys.shift();

        if (!DataContentHelper.isObject(content)) {
            DataContentHelper.throwRecursiveError(completePath, firstKey);
        }

        if (!Object.keys(content.getValue()).includes(firstKey)) {
            DataContentHelper.throwRecursiveError(completePath, firstKey);
        }

        let lastKey = firstKey;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const contentValue: ContentType = keys.reduce((value: ContentType, currentKey: string) => {
            try {
                if (!value) {
                    DataContentHelper.throwRecursiveError(completePath, lastKey);
                }

                return DataContentHelper.getPathValue(currentKey, value, completePath);
            } finally {
                lastKey = currentKey;
            }
        }, content.getValue()[firstKey]);

        return DataContentHelper.create(contentValue);
    }

    /**
     *
     */
    public static setByPath(key: string | string[], value: ContentType, content: DataContent): DataContent {
        /**
         *
         */
        const getDataContentObject = (contentObject: DataContent): DataContentObject => {
            if (!DataContentHelper.isObject(contentObject)) {
                throw Error(`cannot set value to an '${ContentInstance[contentObject.type]}' value`);
            }
            return contentObject.asDataContentObject();
        };

        const keys = Array.isArray(key) ? key : DataContentHelper.splitKeys(key);
        const lastKey = keys.pop();

        const parentContent = content || DataContentHelper.create({});
        let currentContent = parentContent;

        for (const currentKey of keys) {
            const currentObjectContent = getDataContentObject(currentContent);
            const nextValue = currentObjectContent.get(currentKey);
            currentContent = DataContentHelper.create(nextValue || {});
            currentObjectContent.set(currentKey, currentContent);
        }

        const lastObjectContent = getDataContentObject(currentContent);
        lastObjectContent.set(lastKey, DataContentHelper.create(value));

        return parentContent;
    }

    /**
     *
     */
    public static splitKeys(key: string): string[] {
        key = (key || '') //
            .replace(/^\[(\d+)\]/g, '$1') // [0].x.x
            .replace(/\[(\d+)\]/g, '.$1'); // x.x[0].x
        return !key ? [] : key.split(/[#.]/);
    }
}
