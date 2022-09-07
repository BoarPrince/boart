import { ContentInstance } from './ContentInstance';
import { ContentType } from './ContentType';
import { DataContent } from './DataContent';
import { DataContentObject } from './DataContentObject';
import { DataType } from './DataType.enum';
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
    private static tryParse(content: string, failedContent = null): object | string {
        try {
            return JSON.parse(content);
        } catch (error) {
            return failedContent;
        }
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
    static getType(variable: ContentType): DataType {
        if (variable == null) {
            return DataType.isNullOrUndefined;
        } else if (Array.isArray(variable)) {
            return DataType.Array;
        } else if (DataContentHelper.isContent(variable)) {
            return DataType.DataContent;
        } else if (typeof variable === 'object') {
            return DataType.Object;
        } else if (typeof variable === 'boolean') {
            return DataType.Boolean;
        } else if (typeof variable === 'number') {
            return DataType.Number;
        } else if (typeof variable === 'string') {
            return DataType.String;
        } else {
            return DataType.Unknown;
        }
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
        if (!Object.keys(value).includes(property)) {
            DataContentHelper.throwRecursiveError(completePath, property);
        } else {
            return value[property];
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
    public static getByPath(key: string | string[], content?: DataContent | null): DataContent {
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
    public static splitKeys(key: string | null): string[] {
        key = (key || '') //
            .replace(/^\[(\d+)\]/g, '$1') // [0].x.x
            .replace(/\[(\d+)\]/g, '.$1'); // x.x[0].x
        return !key ? [] : key.split(/[#.]/);
    }
}
