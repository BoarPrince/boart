import { PropertyIterable } from '../value/PropertyIterable';
import { PropertyParser } from '../value/PropertyParser';

import { ContentInstance } from './ContentInstance';
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
        if (!variable) {
            return false;
        }

        if (Array.isArray(variable)) {
            return false;
        }

        // if (typeof variable === 'object') {
        //     return true;
        // }

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
    private static throwRecursiveError(property: string, current: string, content?: ContentType) {
        const contentMsg = !content ? '' : `\nData context:\n${JSON.stringify(content, null, '  ')}`;
        throw Error(`getting "${property}" not possible, because "${current}" is not an object or an array.${contentMsg}`);
    }

    /**
     *
     */
    public static getByPath(selector: string, value: DataContent, optional?: boolean): DataContent;
    public static getByPath(properties: PropertyIterable, value: DataContent, optional?: boolean): DataContent;
    public static getByPath(selectorOrProperties: string | PropertyIterable, value: DataContent, optional = false): DataContent {
        if (typeof selectorOrProperties == 'string') {
            selectorOrProperties = PropertyParser.parseProperty(selectorOrProperties);
        }

        if (selectorOrProperties.length === 0) {
            return value;
        }

        let contentValue = value;
        for (const property of selectorOrProperties) {
            const contentValueAsObject = contentValue?.asDataContentObject();
            if (contentValueAsObject == null) {
                DataContentHelper.throwRecursiveError(property.path, property.key, contentValue?.getValue());
            }

            const propertyValue = contentValueAsObject.get(property.key);
            const prevContentValue = contentValue;
            contentValue = DataContentHelper.create(propertyValue);
            if (propertyValue == null) {
                if (property.isOptional || optional) {
                    break;
                } else if (!contentValueAsObject.has(property.key)) {
                    DataContentHelper.throwRecursiveError(property.path, property.key, prevContentValue.getValue());
                }
            }
        }

        return contentValue;
    }

    /**
     *
     */
    public static hasPath(selector: string, value: DataContent): boolean;
    public static hasPath(properties: PropertyIterable, value: DataContent): boolean;
    public static hasPath(selectorOrProperties: string | PropertyIterable, value: DataContent): boolean {
        if (typeof selectorOrProperties == 'string') {
            selectorOrProperties = PropertyParser.parseProperty(selectorOrProperties);
        }

        if (selectorOrProperties.length === 0) {
            return true;
        }

        let contentValue = value;
        for (const property of selectorOrProperties) {
            const contentValueAsObject = contentValue?.asDataContentObject();
            if (contentValueAsObject == null) {
                return false;
            }

            const propertyValue = contentValueAsObject.get(property.key);
            contentValue = DataContentHelper.create(propertyValue);
            if (propertyValue == null) {
                if (property.isOptional) {
                    break;
                } else if (!contentValueAsObject.has(property.key)) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     *
     */
    public static setByPath(selector: string, value: ContentType, content: DataContent): DataContent;
    public static setByPath(properties: PropertyIterable, value: ContentType, content: DataContent): DataContent;
    public static setByPath(selectorOrProperties: string | PropertyIterable, value: ContentType, content: DataContent): DataContent {
        if (typeof selectorOrProperties == 'string') {
            selectorOrProperties = PropertyParser.parseProperty(selectorOrProperties);
        }

        content = DataContentHelper.isNullOrUndefined(content) ? null : content;
        let currentContent = (content = DataContentHelper.create(content || {}));
        for (const property of selectorOrProperties.noLast()) {
            if (!currentContent.asDataContentObject()) {
                throw Error(
                    `cannot set value to an '${ContentInstance[currentContent.type]}' value, selector: ${JSON.stringify(
                        selectorOrProperties.path
                    )}`
                );
            }

            const currentValue = currentContent.asDataContentObject().get(property.key);
            if (currentValue == null) {
                const emptyObject = DataContentHelper.create({});
                currentContent.asDataContentObject().set(property.key, emptyObject);
                currentContent = emptyObject;
            } else {
                currentContent = DataContentHelper.create(currentValue);
            }
        }

        currentContent.asDataContentObject().set(selectorOrProperties.last().key, DataContentHelper.create(value));
        return content;
    }
}
