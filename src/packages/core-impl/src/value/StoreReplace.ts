import { ScopedType, ScopeType, Store, StoreMap, ValueReplacer } from '@boart/core';

/**
 *
 */
export class StoreReplacer implements ValueReplacer {
    private static readonly re = /^(?<property>[^:]+)(:-(?<default>.*))?$/;
    readonly name = 'store';
    readonly nullable = true;
    private _stores: Array<StoreMap>;

    /**
     *
     */
    get scoped(): ScopedType {
        return ScopedType.multiple;
    }

    /**
     *
     */
    get priority(): number {
        return 950;
    }

    /**
     *
     */
    private get stores(): Array<StoreMap> {
        const store = Store.instance;
        if (!this._stores) {
            this._stores = [store.globalStore, store.localStore, store.testStore, store.stepStore];
        }
        return this._stores;
    }

    /**
     *
     */
    private getPropertyValue(property: string, store: StoreMap, scope?: string): string {
        if (!scope) {
            for (const store of this.stores) {
                const storeContent = store.get(property)?.toString();
                if (!!storeContent) {
                    return storeContent;
                }
            }
        } else {
            return store.get(property)?.toString();
        }
    }

    /**
     *
     */
    replace(definition: string, store: StoreMap, scope: string): string {
        const match = definition.match(StoreReplacer.re);

        const property = match.groups.property;
        const content = this.getPropertyValue(property, store, scope);

        if (!content) {
            return match.groups.default;
        }

        return content;
    }
}
