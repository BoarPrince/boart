import { Initializer } from '../common/Initializer';
import { Store } from '../store/Store';
import { StoreWrapper } from '../store/StoreWrapper';
import { ScopeType } from '../types/ScopeType';
import { ScopedType } from '../types/ScopedType';

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
    private stores: Array<StoreWrapper> = [];
    private static _instance: ValueReplacerHandler;

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
        if (!ValueReplacerHandler._instance) {
            ValueReplacerHandler._instance = new ValueReplacerHandler();
            ValueReplacerHandler._instance.init();
        }
        return ValueReplacerHandler._instance;
    }
    /**
     *
     */
    private init(): void {
        this.stores = [Store.instance.stepStore, Store.instance.testStore, Store.instance.localStore, Store.instance.globalStore];
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
    private replaceOnce(value: string): string {
        const replacedValue = this.valueReplacers.reduce((v, r) => {
            const re = new RegExp(`\\\${${r.identifier}(?<optional>[?]?):((?<scope>[glts]):)?(?<property>[^{}]+)}`, 'g');
            const match = re.exec(v);
            if (match) {
                const optional = match.groups.optional;
                const scope = match.groups.scope;
                const property = match.groups.property;
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                return v?.replace(re, (_matchedSubString: string) => {
                    const storeIdentifier = !r.replacer.getProperty ? `#${r.identifier}#:#${property}#` : r.replacer.getProperty(property);

                    switch (r.replacer.scoped) {
                        case ScopedType.false: {
                            const content = r.replacer.replace(property);
                            return ValueReplacerHandler.checkNull(content, r.replacer.nullable, !!optional, r.identifier, property);
                        }
                        case ScopedType.true: {
                            const store = ValueReplacerHandler.getStore(scope);
                            let content = store.get(storeIdentifier)?.toString();
                            if (!content) {
                                const value = r.replacer.replace(property);
                                content = ValueReplacerHandler.checkNull(value, r.replacer.nullable, !!optional, r.identifier, property);
                                store.put(storeIdentifier, content);
                            }
                            return content;
                        }
                        case ScopedType.multiple: {
                            for (const store of this.stores) {
                                const storeContent = store.get(storeIdentifier)?.toString();
                                if (!!storeContent) {
                                    return storeContent;
                                }
                            }
                            const content = r.replacer.replace(property);
                            return ValueReplacerHandler.checkNull(content, r.replacer.nullable, !!optional, r.identifier, property);
                        }
                    }
                });
            } else {
                return v;
            }
        }, value);

        switch (replacedValue) {
            case 'null':
                return null;
            case 'undefined':
                return null;
            default:
                return replacedValue;
        }
    }
}
