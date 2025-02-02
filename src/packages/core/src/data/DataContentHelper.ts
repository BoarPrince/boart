import { ContentType } from './ContentType';
import { DataContent } from './DataContent';
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
            return JSON.parse(content) as object;
        } catch (error) {
            try {
                // try again without comments in json
                return JSON.parse(content?.replace(/[\n]?\s[^\S]*\/\/.*[\n]?/g, '')) as object;
            } catch (error) {
                return failedContent as string;
            }
        }
    }

    /**
     *
     */
    static isContent(variable: unknown): boolean {
        const dataContentCandidate = variable as DataContent;
        return !!variable && !!dataContentCandidate.getValue && !!dataContentCandidate.isObject;
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
    static isNative(variable: unknown): boolean {
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
        if (!variable) {
            return false;
        }

        if (Array.isArray(variable)) {
            return false;
        }

        if (!DataContentHelper.isContent(variable)) {
            return false;
        }
        return DataContentHelper.toObject(variable) != null;
    }

    /**
     *
     */
    public static toObject(variable: ContentType): DataContent {
        const contentVariable = DataContentHelper.create(variable);
        if (typeof contentVariable.isObject !== 'function') {
            return null;
        } else if (contentVariable.isObject() === false) {
            return null;
        }

        return contentVariable;
    }

    /**
     *
     */
    static create(value?: unknown): DataContent {
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
            return new ObjectContent(value as ContentType);
        }
    }
}
