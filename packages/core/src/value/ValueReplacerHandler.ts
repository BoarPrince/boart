import { Initializer } from '../common/Initializer';
import { Store } from '../store/Store';
import { StoreWrapper } from '../store/StoreWrapper';
import { ScopeType } from '../types/ScopeType';
import { ScopedType } from '../types/ScopedType';

import { ValueReplacer } from './ValueReplacer';

/**
 *
 */
export class ValueReplacerHandler implements Initializer<ValueReplacer> {
    private valueReplacers: Array<{
        readonly identifier: string;
        readonly replacer: ValueReplacer;
    }>;
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
        this.valueReplacers = this.valueReplacers.filter(r => r.identifier !== name);
    }

    /**
     *
     */
    public add(name: string, item: ValueReplacer): Initializer<ValueReplacer> {
        if (!!this.valueReplacers.find(r => r.identifier === name)) {
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
        replacer?.forEach(r => this.add(r.name, r));
        return this;
    }

    /**
     *
     */
    public replace(value: string): string {
        let replacedValue = this.replaceOnce(value);
        while (value !== replacedValue) {
            value = replacedValue;
            replacedValue = this.replaceOnce(value);
        }
        return value;
    }

    /**
     *
     */
    private replaceOnce(value: string): string {
        return this.valueReplacers.reduce((v, r) => {
            const re = new RegExp(`\\\${${r.identifier}:((?<scope>[glts]):)?(?<property>[^{}]+)}`, 'g');
            return v.replace(re, (m, scope_, scope: string, property: string) => {
                switch (r.replacer.scoped) {
                    case ScopedType.false:
                        scope = null;
                        break;
                    case ScopedType.multiple:
                        scope = scope || ScopeType.ReadonlyMultiple;
                }

                const storeIdentifier = !r.replacer.getProperty ? `#${r.identifier}#:#${property}#` : r.replacer.getProperty(property);

                let store: StoreWrapper;
                switch (scope) {
                    case ScopeType.Global: {
                        store = Store.instance.globalStore;
                        break;
                    }
                    case ScopeType.Local: {
                        store = Store.instance.localStore;
                        break;
                    }
                    case ScopeType.Test: {
                        store = Store.instance.testStore;
                        break;
                    }
                    case ScopeType.Step: {
                        store = Store.instance.stepStore;
                        break;
                    }
                    case ScopeType.ReadonlyMultiple: {
                        for (store of this.stores) {
                            const storeContent = store.get(storeIdentifier)?.toString();
                            if (!!storeContent) {
                                return storeContent;
                            }
                        }
                        const multipleContent = r.replacer.replace(property);
                        if (!multipleContent) {
                            throw new Error(`can't find value of '${property}'`);
                        } else {
                            return multipleContent;
                        }
                    }
                    default: {
                        return r.replacer.replace(property);
                    }
                }

                let content = store.get(storeIdentifier)?.toString();
                if (!content) {
                    content = r.replacer.replace(property);
                    store.put(storeIdentifier, content);
                }
                return content;
            });
        }, value);
    }
}
