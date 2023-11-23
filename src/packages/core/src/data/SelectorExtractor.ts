import { Selector } from '../parser/ast/Selector';
import { SelectorArray } from '../parser/ast/SelectorArray';
import { SelectorType } from '../parser/ast/SelectorType';
import { ValueReplaceArg } from '../value/ValueReplacer';

import { ContentInstance } from './ContentInstance';
import { ContentType } from './ContentType';
import { DataContent } from './DataContent';
import { DataContentHelper } from './DataContentHelper';
import { ObjectContent } from './ObjectContent';
import { WildcardObjectContent } from './WildcardObjectContent';

/**
 *
 */
export class SelectorExtractor {
    /**
     *
     */
    private static throwRecursiveError(property: string, current: string, content?: ContentType): DataContent {
        const contentMsg = !content ? '' : `\nData context:\n${JSON.stringify(content, null, '  ')}`;
        throw Error(`getting "${property}" not possible, because "${current}" is not an object or an array.${contentMsg}`);
    }

    /**
     *
     */
    private static throwRecursiveArrayError(property: string, current: string, content?: ContentType): DataContent {
        const contentMsg = !content ? '' : `\nData context:\n${JSON.stringify(content, null, '  ')}`;
        throw Error(`getting "${property}" not possible, because "${current}" is not used for an array.${contentMsg}`);
    }

    /**
     *
     */
    public static getValueByAst(ast: ValueReplaceArg, value: ContentType, throwError = true): DataContent {
        if (!!ast.default?.value) {
            ast.selectors?.forEach((selector) => (selector.optional = true));
        }

        try {
            return SelectorExtractor.getValueBySelector(ast.selectors, value, throwError);
        } catch (error) {
            throw new Error(`'${ast.match}' not defined`);
        }
    }

    /**
     *
     */
    public static getValueBySelector(selectors: SelectorArray, value: ContentType, throwError = true): DataContent {
        let contentValue = DataContentHelper.create(value);
        let propertyValue: DataContent;

        for (const selector of selectors || []) {
            // Content must be an object, otherwise no selector can be used
            // array is an object
            const contentValueAsObject = contentValue?.asDataContentObject();
            if (contentValueAsObject == null) {
                SelectorExtractor.throwRecursiveError(selectors.match, selector.value, contentValue?.getValue());
            }

            if (selector.type === SelectorType.SIMPLE) {
                const extractedValue = contentValueAsObject.get(selector.value);
                propertyValue = extractedValue != null ? DataContentHelper.create(extractedValue) : null;
            } else {
                // if the selector starts with an array selector
                propertyValue = propertyValue ?? contentValue;

                const arrayPropertyValue = selector.value
                    ? // when e.g. a[1]
                      DataContentHelper.create(propertyValue.asDataContentObject().get(selector.value)).asDataContentObject()
                    : // all other selector types are only array types
                      // only [1]
                      propertyValue.asDataContentObject();

                if (arrayPropertyValue) {
                    if (!Array.isArray(arrayPropertyValue.valueOf())) {
                        return throwError
                            ? SelectorExtractor.throwRecursiveArrayError(selectors.match, selector.value, arrayPropertyValue)
                            : null;
                    }

                    switch (selector.type) {
                        case SelectorType.INDEX: {
                            propertyValue = DataContentHelper.create(arrayPropertyValue.get(selector.index));
                            break;
                        }
                        case SelectorType.LIST: {
                            propertyValue = new ObjectContent([]);
                            for (const index of selector.indexes) {
                                propertyValue.asDataContentObject().set(index, arrayPropertyValue.get(index));
                            }
                            break;
                        }
                        case SelectorType.START: {
                            propertyValue = new ObjectContent([]);
                            const start: number = selector.start;
                            for (let index = start; index < arrayPropertyValue.length; index++) {
                                propertyValue.asDataContentObject().set(index, arrayPropertyValue.get(index));
                            }
                            break;
                        }
                        case SelectorType.END: {
                            propertyValue = new ObjectContent([]);
                            const end: number = selector.end >= 0 ? selector.end : arrayPropertyValue.length + (selector.end || 0);
                            for (let index = 0; index < end; index++) {
                                propertyValue.asDataContentObject().set(index, arrayPropertyValue.get(index));
                            }
                            break;
                        }
                        case SelectorType.STARTEND: {
                            propertyValue = new ObjectContent([]);
                            const start: number = selector.start;
                            const end: number = selector.end >= 0 ? selector.end : arrayPropertyValue.length + (selector.end || 0);
                            for (let index = start; index < end; index++) {
                                propertyValue.asDataContentObject().set(index, arrayPropertyValue.get(index));
                            }
                            break;
                        }
                        case SelectorType.WILDCARD: {
                            propertyValue = new WildcardObjectContent(arrayPropertyValue.valueOf() as Array<object>);
                            break;
                        }
                    }
                } else {
                    return throwError ? SelectorExtractor.throwRecursiveArrayError(selectors.match, selector.value, propertyValue) : null;
                }
            }

            const prevContentValue = contentValue;
            contentValue = DataContentHelper.create(propertyValue);
            if (propertyValue == null) {
                if (selector.optional) {
                    break;
                } else if (!contentValueAsObject.has(selector.value)) {
                    return throwError
                        ? SelectorExtractor.throwRecursiveError(selectors.match, selector.value, prevContentValue?.getValue())
                        : null;
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
    public static setValueByAst(ast: ValueReplaceArg, value: ContentType, contentValue: DataContent): DataContent {
        if (!!ast.default?.value) {
            ast.selectors?.forEach((selector) => (selector.optional = true));
        }

        try {
            return SelectorExtractor.setValueBySelector(ast.selectors, value, contentValue);
        } catch (error) {
            throw new Error(`'${ast.match}' not defined`);
        }
    }

    /**
     *
     */
    public static setValueBySelector(selectors: SelectorArray, value: ContentType, contentValue: DataContent): DataContent {
        const selectors_: SelectorArray = Object.assign([], selectors);

        const lastSelector = selectors_.pop();
        const selectorList = new Array<{ sel: Selector; cont: DataContent }>();

        // all selectors are optional when setting a value
        selectors_.forEach((selector) => (selector.optional = true));

        let currentContentValue = contentValue;
        for (const selector of selectors_) {
            selectorList.push({ sel: selector, cont: currentContentValue });

            const selectorArry: SelectorArray = [selector];
            selectorArry.match = selectors_.match;
            const contentValueAfterSelect = this.getValueBySelector(selectorArry, currentContentValue, false);

            // auto extend object tree
            if (!contentValueAfterSelect?.valueOf()) {
                const emptyObjectContent = new ObjectContent({});
                this.setValue(selector, currentContentValue, emptyObjectContent);
                currentContentValue = emptyObjectContent;
            } else {
                currentContentValue = contentValueAfterSelect;
            }

            // check if current object is an object. Because only objects can be extend.
            if (!currentContentValue.asDataContentObject()) {
                throw Error(
                    `cannot set value to an '${ContentInstance[contentValueAfterSelect.type]}' value, selector: ${JSON.stringify(
                        selectors_.match
                    )}, current element: ${lastSelector.value}`
                );
            }
        }

        selectorList.push({ sel: lastSelector, cont: currentContentValue });

        return selectorList.reverse().reduce((currentValue, selectorElement) => {
            const result = SelectorExtractor.setValue(selectorElement.sel, selectorElement.cont, currentValue);
            return result;
        }, DataContentHelper.create(value));
    }

    /**
     *
     */
    private static setValue(selector: Selector, contentValue: DataContent, value: ContentType): DataContent {
        if (!selector) {
            return DataContentHelper.create(value);
        }

        switch (selector.type) {
            case SelectorType.SIMPLE: {
                contentValue.asDataContentObject().set(selector.value, value);
                break;
            }
            case SelectorType.INDEX: {
                if (!selector.value) {
                    // start selector
                    contentValue.asDataContentObject().set(selector.index, value);
                } else {
                    const arrayValue = new ObjectContent(contentValue.asDataContentObject()?.get(selector.value) || []);
                    arrayValue.set(selector.index, value);
                    contentValue.asDataContentObject().set(selector.value, arrayValue);
                }
            }
        }
        return contentValue;
    }
}
