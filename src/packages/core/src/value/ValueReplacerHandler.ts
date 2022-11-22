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
enum ReplacementMode {
    RemoveBrackets,
    RetractBrackets
}

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
        // eslint-disable-next-line @typescript-eslint/unbound-method
        item.defaultScopeType = item.defaultScopeType || (() => null);

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
     * Needed for inplace/recursive replacement, e.g. store
     *
     * When a complete JSON expression is used as parameter.
     * Can happen with a statement like this ${store:att1.att11:=${store:att2}}
     * and ${store:att2} is replaced to JSON expression.
     */
    private static replaceCurlyBrackets(value: string, mode: ReplacementMode): string {
        if (!value) {
            return value;
        }

        if (mode === ReplacementMode.RemoveBrackets) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            return value.replaceAll('{', '\x01').replaceAll('}', '\x02');
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            return value
                .replaceAll('\x01', '{') //
                .replaceAll('\x03', '{')
                .replaceAll('\x02', '}')
                .replaceAll('\x04', '}');
        }
    }

    /**
     *
     * @param value contains replacement expressions
     *              like: ${store:var}
     * @returns     replaced expression by it's value
     */
    public static replace(value: string): string {
        return ValueReplacerHandler.instance.replace(value);
    }

    /**
     *
     */
    public replace(value: string): string {
        // replace without null checking
        let replacedValue = this.replaceOnce(value, false);
        while (value !== replacedValue) {
            value = replacedValue;
            // recursive replacement
            replacedValue = this.replaceOnce(value, false);
        }

        // replace with null checking, if needed
        replacedValue = this.replaceOnce(value);
        while (value !== replacedValue) {
            value = replacedValue;
            // recursive replacement
            replacedValue = this.replaceOnce(value);
        }

        replacedValue = ValueReplacerHandler.replaceCurlyBrackets(value, ReplacementMode.RetractBrackets);
        if (!replacedValue) {
            return replacedValue;
        } else {
            return replacedValue.replace(/[\n]?\s[^\S]*\/\/.*[\n]?/g, '');
        }
    }

    /**
     *
     */
    private static checkNull(
        value: string,
        nullable: boolean,
        optional: boolean,
        identifier: string,
        property: string,
        checkNull: boolean
    ): string {
        if (value == null && !(nullable && optional)) {
            if (checkNull === true) {
                throw new Error(`can't find value of '${identifier}:${property}'`);
            }
            return `$\x03${identifier}:${property}\x04`;
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
            case ScopeType.Test: {
                return Store.instance.testStore;
            }
            default: {
                return Store.instance.nullStore;
            }
        }
    }

    /**
     *
     */
    private stringReplacer(r: ValueReplaceItem, optional: boolean, scope: string, property: string, selector: string, checkNull: boolean) {
        property = ValueReplacerHandler.replaceCurlyBrackets(property, ReplacementMode.RetractBrackets);
        const defaultScope = r.replacer.defaultScopeType(property);
        const store = ValueReplacerHandler.getStore(scope || defaultScope);
        const content = r.replacer.replace(property, store, scope as ScopeType);

        return ValueReplacerHandler.replaceCurlyBrackets(
            ValueReplacerHandler.checkNull(content, r.replacer.nullable, optional, r.identifier, property, checkNull),
            ReplacementMode.RemoveBrackets
        );
    }

    /**
     *
     */
    private replaceOnce(value: string, checkNull = true): string {
        // eslint-disable-next-line no-control-regex
        const re = new RegExp(/\$[{|\x03]([^{}\x03\x04]+)[}|\x04]/, 'g');
        const replacedValue = !value
            ? value
            : value.replace(re, (matchedValue: string) => {
                  const property = PropertyParser.parse(matchedValue.replace('\x03', '{').replace('\x04', '}'));

                  return this.valueReplacers.reduce((v, r) => {
                      return !!property &&
                          // replacer must fit
                          property.replacer === r.identifier
                          ? this.stringReplacer(r, property.isOptional, property.scope, property.property, property.selector, checkNull)
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
