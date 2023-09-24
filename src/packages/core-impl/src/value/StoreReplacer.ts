import { DefaultOperatorParser, OperatorType, ScopedType, ScopeType, Store, StoreWrapper, ValueReplacer } from '@boart/core';

import { ReplaceArg, ValueReplacerConfig } from './ValueReplacer';

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
        selectorsCountMin: 1,
        selectorsCountMax: Number.MAX_VALUE,
        defaultScopeType: ScopeType.Test
    };

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
                if (storeContent != null) {
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
        const defaultOperator = DefaultOperatorParser.parse(definition);

        const property = defaultOperator.property;
        const content = this.getPropertyValue(property, store, scope, !!defaultOperator.operator);

        if (content == null) {
            switch (defaultOperator.operator.type) {
                case OperatorType.Default:
                    return defaultOperator.defaultValue;
                case OperatorType.DefaultAssignment:
                    store.put(property, defaultOperator.defaultValue);
                    return defaultOperator.defaultValue;
                case OperatorType.None:
                    return null;
                case OperatorType.Unknown:
                default:
                    throw Error(`store default operator '${defaultOperator.operator.value}' not valid (${definition})`);
            }
        } else {
            switch (defaultOperator.operator.type) {
                case OperatorType.Unknown:
                    switch (defaultOperator.operator.value) {
                        case 'lowercase':
                            return content.toLowerCase();
                        case 'upercase':
                            return content.toUpperCase();
                    }
                    break;
                default:
                    return content;
            }
        }
    }

    /**
     *
     * @param arg parser arguments
     * @param store store to be used
     */
    replace2(arg: ReplaceArg, store: StoreWrapper): string {
        const isOptional = !!arg.default;

        const selectors: string = arg.selectors.reduce((prev, current) => {
            const delim = (current.optional ? '?' : '') + '.';
            return prev + (prev ? delim : '') + current.value;
        }, arg.qualifier.value || '');

        if (!store) {
            // if no scope is defined, iterate over the scopes
            for (const store of this.stores) {
                const storeContent = store.get(selectors, isOptional);
                if (storeContent != null) {
                    return storeContent.toString();
                }
            }
        } else {
            return store.get(selectors, isOptional)?.toString();
        }
    }
}
