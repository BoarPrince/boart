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
    private static NATIVE_NUMBER = new RegExp(/^(\d+\.\d+|\d+)$/);
    private static NATIVE_BOOLEAN = new RegExp(/^(false|true)$/);
    private static NATIVE_REGEXP = new RegExp(/^(\d+\.\d+|\d+|false|true)$/);
    private static NATIVE_WITH_QUOTES_REGEXP = RegExp(/^"(["]*(\d+\.\d+|\d+|false|true|undefined|null)["]*)"$/);

    /**
     *
     */
    static tryParse(content: string, failedContent = null): object | string {
        try {
            if (DataContentHelper.NATIVE_WITH_QUOTES_REGEXP.test(content)) {
                return content;
            } else {
                return JSON.parse(content);
            }
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

        const generator = (value: unknown) => {
            if (value === null) {
                return new NullContent();
            } else if (value === undefined) {
                return new NativeContent(undefined);
            } else if (typeof value === 'string') {
                return new TextContent(value);
            } else if (typeof value == 'boolean') {
                return new NativeContent(value);
            } else if (typeof value == 'number') {
                return new NativeContent(value);
            } else if (Array.isArray(value)) {
                return new ObjectContent(value);
            }

            const map = new ObjectContent();
            Object.entries(value).forEach(([pName, pValue]) => {
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
    static isNullOrUndefined(variable: ContentType) {
        if (variable == null) {
            return true;
        }

        if (DataContentHelper.isContent(variable)) {
            return (variable as DataContent).isNullOrUndefined();
        }

        return false;
    }

    /**
     *
     */
    static isNative(variable: ContentType): boolean {
        return (
            typeof variable === 'boolean' ||
            typeof variable === 'number' ||
            (typeof variable === 'string' && DataContentHelper.NATIVE_REGEXP.test(variable))
        );
    }

    /**
     *
     */
    static toNative(variable: boolean | number | string): number | boolean {
        if (typeof variable === 'boolean' || typeof variable === 'number') {
            return variable;
        } else if (DataContentHelper.NATIVE_BOOLEAN.test(variable)) {
            return variable === 'true';
        } else if (DataContentHelper.NATIVE_NUMBER.test(variable)) {
            return Number(variable).valueOf();
        }
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
    static toJSON(data: ContentType): string {
        return DataContentHelper.create(data).toJSON();
    }

    /**
     *
     */
    static create(value?: ContentType): DataContent {
        if (value === null) {
            return new NullContent();
        } else if (value === undefined) {
            return new NativeContent(undefined);
        } else if (DataContentHelper.isContent(value)) {
            return value as DataContent;
        } else if (typeof value === 'string') {
            switch (value) {
                case 'undefined':
                    return new NativeContent(undefined);
                case 'null':
                    return new NullContent();
                default:
                    if (DataContentHelper.NATIVE_WITH_QUOTES_REGEXP.test(value)) {
                        // return new TextContent(JSON.parse(value) as string);
                        // remove quotes
                        return new TextContent(value.replace(DataContentHelper.NATIVE_WITH_QUOTES_REGEXP, '$1'));
                    } else if (DataContentHelper.isNative(value)) {
                        return new NativeContent(DataContentHelper.toNative(value));
                    } else {
                        const valueAsObject = DataContentHelper.tryParse(value);
                        if (!valueAsObject) {
                            return new TextContent(value);
                        } else {
                            return new ObjectContent(valueAsObject);
                        }
                    }
            }
        } else if (Array.isArray(value)) {
            return new ObjectContent(value);
        } else if (DataContentHelper.isNative(value)) {
            return new NativeContent(value as boolean | number);
        } else {
            return new ObjectContent(value);
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

        const contentValue: ContentType = keys.reduce((value: ContentType, currentKey: string) => {
            try {
                if (!value) {
                    DataContentHelper.throwRecursiveError(completePath, lastKey);
                }

                return DataContentHelper.getPathValue(currentKey, value, completePath);
            } finally {
                lastKey = currentKey;
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        }, content.getValue()[firstKey]);

        return DataContentHelper.create(contentValue);
    }

    /**
     *
     */
    public static setByPath(selector: string | string[], value: ContentType, content: DataContent): DataContent {
        /**
         *
         */
        const getDataContentObject = (contentObject: DataContent): DataContentObject => {
            if (!DataContentHelper.isObject(contentObject)) {
                throw Error(`cannot set value to an '${ContentInstance[contentObject.type]}' value`);
            }
            return contentObject.asDataContentObject();
        };

        const keys = Array.isArray(selector) ? selector : DataContentHelper.splitKeys(selector);
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
