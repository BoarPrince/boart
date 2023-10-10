import { last } from 'rxjs';
import { Selector } from '../parser/ast/Selector';
import { SelectorArray } from '../parser/ast/SelectorArray';
import { SelectorType } from '../parser/ast/SelectorType';

import { ContentInstance } from './ContentInstance';
import { ContentType } from './ContentType';
import { DataContent } from './DataContent';
import { DataContentHelper } from './DataContentHelper';
import { ObjectContent } from './ObjectContent';

/**
 *
 */
export class SelectorExtractor {
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
    private static throwRecursiveArrayError(property: string, current: string, content?: ContentType) {
        const contentMsg = !content ? '' : `\nData context:\n${JSON.stringify(content, null, '  ')}`;
        throw Error(`getting "${property}" not possible, because "${current}" does not used for an array.${contentMsg}`);
    }

    /**
     *
     */
    public static getValueBySelector(selectors: SelectorArray, value: ContentType): DataContent {
        let contentValue = DataContentHelper.create(value);
        let propertyValue: ContentType;

        for (const selector of selectors) {
            // Content must be an object, otherwise no selector can be used
            // array is an object
            const contentValueAsObject = contentValue?.asDataContentObject();
            if (contentValueAsObject == null) {
                SelectorExtractor.throwRecursiveError(selectors.match, selector.value, contentValue?.getValue());
            }

            if (selector.type === SelectorType.SIMPLE) {
                propertyValue = contentValueAsObject.get(selector.value);
            } else {
                // if the selector starts with an array selector
                propertyValue = propertyValue ?? contentValue;

                // all other selector types are array types
                if (Array.isArray(propertyValue.valueOf())) {
                    const internalArray = propertyValue.valueOf() as object as Array<ContentType>;

                    switch (selector.type) {
                        case SelectorType.INDEX: {
                            propertyValue = internalArray[selector.index || 0];
                            break;
                        }
                        case SelectorType.LIST: {
                            propertyValue = new Array<ContentType>();
                            for (const index of selector.indexes) {
                                (propertyValue as Array<ContentType>).push(internalArray[index]);
                            }
                            break;
                        }
                        case SelectorType.START: {
                            propertyValue = new Array<ContentType>();
                            const start: number = selector.start;
                            for (let index = start; index < internalArray.length; index++) {
                                (propertyValue as Array<ContentType>).push(internalArray[index]);
                            }
                            break;
                        }
                        case SelectorType.END: {
                            propertyValue = new Array<ContentType>();
                            const end: number = selector.end >= 0 ? selector.end : internalArray.length + (selector.end || 0);
                            for (let index = 0; index < end; index++) {
                                (propertyValue as Array<ContentType>).push(internalArray[index]);
                            }
                            break;
                        }
                        case SelectorType.STARTEND: {
                            propertyValue = new Array<ContentType>();
                            const start: number = selector.start;
                            const end: number = selector.end >= 0 ? selector.end : internalArray.length + (selector.end || 0);
                            for (let index = start; index < end; index++) {
                                (propertyValue as Array<ContentType>).push(internalArray[index]);
                            }
                            break;
                        }
                        case SelectorType.WILDCARD: {
                            propertyValue = new Array<ContentType>();
                            for (const value of internalArray) {
                                (propertyValue as Array<ContentType>).push(value);
                            }
                            break;
                        }
                    }
                } else {
                    SelectorExtractor.throwRecursiveArrayError(selectors.match, selector.value, propertyValue);
                }
            }

            const prevContentValue = contentValue;
            contentValue = DataContentHelper.create(propertyValue);
            if (propertyValue == null) {
                if (selector.optional) {
                    break;
                } else if (!contentValueAsObject.has(selector.value)) {
                    SelectorExtractor.throwRecursiveError(selectors.match, selector.value, prevContentValue?.getValue());
                }
            }
        }
        return contentValue;
    }

    /**
     *
     */
    public static hasValueBySelector(selectors: Selector[], value: DataContent): boolean {
        return !!this.getValueBySelector(selectors, value);
    }

    /**
     *
     */
    public static setValueBySelector(selectors: SelectorArray, value: ContentType, contentValue: DataContent): DataContent {
        const lastSelector = selectors.pop();

        // all selectors are optional when setting a value
        selectors.forEach((selector) => (selector.optional = true));

        let currentContentValue = contentValue;
        for (const selector of selectors) {
            const contentValueAfterSelect = this.getValueBySelector([selector], currentContentValue);

            // auto extend object tree
            if (!contentValueAfterSelect.valueOf()) {
                const emptyObjectContent = new ObjectContent({});
                currentContentValue.asDataContentObject().set(selector.value, emptyObjectContent);
                currentContentValue = emptyObjectContent;
            } else {
                currentContentValue = contentValueAfterSelect;
            }

            // check if current object is an object. Because only objects can be extend.
            if (!currentContentValue.asDataContentObject()) {
                throw Error(
                    `cannot set value to an '${ContentInstance[contentValueAfterSelect.type]}' value, selector: ${JSON.stringify(
                        selectors.match
                    )}, current element: ${lastSelector.value}`
                );
            }
        }

        currentContentValue.asDataContentObject().set(lastSelector.value, value);
        return contentValue;
    }
}
