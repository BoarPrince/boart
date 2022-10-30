import { ScopedType, ScopeType, Store, StoreWrapper, ValueReplacer } from '@boart/core';

/**
 *
 */
export class StoreReplacer implements ValueReplacer {
    private static readonly re = /^(?<property>[^:]+)((?<operator>:.)(?<default>.+))?$/;

    readonly name = 'store';
    readonly nullable = true;
    private _stores: Array<StoreWrapper>;

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
    defaultScopeType(): ScopeType {
        return ScopeType.Test;
    }

    /**
     *
     */
    private get stores(): Array<StoreWrapper> {
        const store = Store.instance;
        if (!this._stores) {
            this._stores = [store.stepStore, store.testStore, store.localStore, store.globalStore];
        }
        return this._stores;
    }

    /**
     *
     */
    private getPropertyValue(property: string, store: StoreWrapper, scope: ScopeType, optional: boolean): string {
        if (!scope) {
            for (const store of this.stores) {
                const storeContent = store.get(property, optional)?.toString();
                if (!!storeContent) {
                    return storeContent;
                }
            }
        } else {
            return store.get(property, optional)?.toString();
        }
    }

    /**
     *
     */
    replace(definition: string, store: StoreWrapper, scope: ScopeType): string {
        const match = definition.match(StoreReplacer.re);
        if (!match) {
            throw new Error(`store expression '${definition}' not valid`);
        }

        const property = match.groups.property;
        const content = this.getPropertyValue(property, store, scope, !!match.groups.operator);

        if (!content) {
            switch (match.groups.operator) {
                case ':-':
                    return match.groups.default;
                case ':=':
                    store.put(property, match.groups.default);
                    return match.groups.default;
                case undefined:
                    return null;
                default:
                    throw Error(`store default operator '${match.groups.operator}' not valid (${definition})`);
            }
        }

        return content;
    }
}
