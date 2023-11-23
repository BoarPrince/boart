import { ScopedType, ScopeType, Store, StoreWrapper, ValueReplaceArg, ValueReplacer, ValueReplacerConfig } from '@boart/core';

/**
 *
 */
export class StoreReplacer implements ValueReplacer {
    readonly name = 'store';
    readonly nullable = true;
    private _stores: Array<StoreWrapper>;

    /**
     *
     */
    readonly config: ValueReplacerConfig = {
        scopeAllowed: true,
        hasQualifier: true,
        qualifierParaCountMax: 0,
        selectorsCountMin: 0,
        selectorsCountMax: Number.MAX_VALUE,
        defaultScopeType: ScopeType.Test
    };

    /**
     *
     */
    get scoped(): ScopedType {
        return ScopedType.Optional;
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
     * Reads value from the store
     * @param ast parser arguments
     * @param store store to be used
     */
    replace(ast: ValueReplaceArg, store: StoreWrapper): string {
        if (!store) {
            // if no scope is defined, iterate over the scopes
            for (const store of this.stores) {
                const storeContent = store.get(ast);
                if (storeContent != null) {
                    return storeContent.toString();
                }
            }
        } else {
            return store.get(ast)?.toString();
        }
    }
}
