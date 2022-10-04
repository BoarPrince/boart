import { ContentType, ScopedType, ScopeType, Store, StoreMap, StoreWrapper, ValueReplacer } from '@boart/core';

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
    private get stores(): Array<StoreWrapper> {
        const store = Store.instance;
        if (!this._stores) {
            this._stores = [store.globalStore, store.localStore, store.testStore, store.stepStore];
        }
        return this._stores;
    }

    /**
     *
     */
    private getPropertyValue(property: string, store: StoreWrapper, scope: ScopeType, check: boolean): string {
        const runable = (runable: () => ContentType, throwError: boolean): string => {
            try {
                return runable()?.toString();
            } catch (error) {
                if (throwError) {
                    throw error;
                }
            }
        };

        if (!scope) {
            for (const store of this.stores) {
                const storeContent = runable(() => store.get(property), check);
                if (!!storeContent) {
                    return storeContent;
                }
            }
        } else {
            return runable(() => store.get(property), check);
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
        const content = this.getPropertyValue(property, store, scope, !match.groups.operator);

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
                    throw Error(`store default operator '${match.groups.operator}' not valid`);
            }
        }

        return content;
    }
}
