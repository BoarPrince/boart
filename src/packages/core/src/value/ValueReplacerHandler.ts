import { Initializer } from '../common/Initializer';
import { Store } from '../store/Store';
import { StoreWrapper } from '../store/StoreWrapper';
import { ScopeType } from '../types/ScopeType';

import { PropertyParser } from './PropertyParser';
import { ValueReplacer } from './ValueReplacer';

/**
 *
 */
type ValueReplaceItem = {
    readonly identifier: string;
    readonly replacer: ValueReplacer;
};

/**
 *
 */
export class ValueReplacerHandler implements Initializer<ValueReplacer> {
    private valueReplacers: Array<ValueReplaceItem>;

    /**
     *
     */
    private constructor() {
        this.valueReplacers = [];
    }

    /**
     *
     */
    public static get instance(): ValueReplacerHandler {
        if (!globalThis._valueReplaceHandlerInstance) {
            const instance = new ValueReplacerHandler();
            globalThis._valueReplaceHandlerInstance = instance;
        }
        return globalThis._valueReplaceHandlerInstance;
    }

    /**
     *
     */
    public clear() {
        this.valueReplacers = [];
    }

    /**
     *
     */
    public delete(name: string) {
        this.valueReplacers = this.valueReplacers.filter((r) => r.identifier !== name);
    }

    /**
     *
     */
    public add(name: string, item: ValueReplacer): Initializer<ValueReplacer> {
        if (!!this.valueReplacers.find((r) => r.identifier === name)) {
            throw Error(`valueReplacer '${name}' already exists!`);
        }
        this.valueReplacers.push({ identifier: name, replacer: item });
        this.valueReplacers = this.valueReplacers.sort((r1, r2) => r1.replacer.priority - r2.replacer.priority);

        return this;
    }

    /**
     *
     */
    addItems(replacer: readonly ValueReplacer[]): Initializer<ValueReplacer> {
        replacer?.forEach((r) => this.add(r.name, r));
        return this;
    }

    /**
     *
     */
    public replace(value: string): string {
        let replacedValue = this.replaceOnce(value);
        while (value !== replacedValue) {
            value = replacedValue;
            // recursive replacement
            replacedValue = this.replaceOnce(value);
        }
        return value;
    }

    /**
     *
     */
    private static checkNull(value: string, nullable: boolean, optional: boolean, identifier: string, property: string): string {
        if (!value && !(nullable && optional)) {
            throw new Error(`can't find value of '${identifier}:${property}'`);
        } else {
            return value;
        }
    }

    /**
     *
     */
    private static getStore(scope: string): StoreWrapper {
        switch (scope) {
            case ScopeType.Global: {
                return Store.instance.globalStore;
            }
            case ScopeType.Local: {
                return Store.instance.localStore;
            }
            case ScopeType.Step: {
                return Store.instance.stepStore;
            }
            default: {
                return Store.instance.testStore;
            }
        }
    }

    /**
     *
     */
    private stringReplacer(r: ValueReplaceItem, optional: boolean, scope: string, property: string) {
        // const storeIdentifier = !r.replacer.getProperty ? `#${r.identifier}#:#${property}#` : r.replacer.getProperty(property);

        const store = ValueReplacerHandler.getStore(scope);
        const content = r.replacer.replace(property, store.store, <ScopeType>ScopeType[scope]);
        return ValueReplacerHandler.checkNull(content, r.replacer.nullable, optional, r.identifier, property);
    }

    /**
     *
     */
    private replaceOnce(value: string): string {
        const re = new RegExp(/\${[^{}]+}/, 'g');
        const replacedValue = !value
            ? value
            : value.replace(re, (matchedValue: string) => {
                  const property = PropertyParser.parse(matchedValue);

                  return this.valueReplacers.reduce((v, r) => {
                      return !!property &&
                          // replacer must fit
                          property.replacer === r.identifier
                          ? this.stringReplacer(r, property.isOptional, property.scope, property.name)
                          : v;
                  }, matchedValue);
              });

        switch (replacedValue) {
            case 'null':
                return null;
            case 'undefined':
                return undefined;
            default:
                return replacedValue;
        }
    }
}
