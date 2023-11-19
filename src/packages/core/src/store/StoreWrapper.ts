import { ContentType } from '../data/ContentType';
import { DataContent } from '../data/DataContent';
import { DataContentHelper } from '../data/DataContentHelper';
import { ObjectContent } from '../data/ObjectContent';
import { SelectorExtractor } from '../data/SelectorExtractor';
import { LogProvider } from '../logging/LogProvider';
import { ScopeType } from '../types/ScopeType';
import { ValueReplaceArg } from '../value/ValueReplacer';

import { Store } from './Store';
import { StoreMap } from './StoreMap';

/**
 *
 */
class ObjectWrapper extends StoreMap {
    /**
     *
     */
    constructor(private map: object) {
        super();
    }

    /**
     *
     */
    put = (ast: ValueReplaceArg, value: DataContent) => (this.map[this.getKey(ast)] = value);

    /**
     *
     */
    get = (ast: ValueReplaceArg) => this.map[this.getKey(ast)] as DataContent;

    /**
     *
     */
    has = (ast: ValueReplaceArg) => Object.keys(this.map).includes(this.getKey(ast));

    /**
     *
     */
    clear = () => (this.map = {});
}

/**
 *
 */
export class StoreWrapper extends StoreMap {
    public readonly store: StoreMap;
    public readonly storeName: string;
    private readonly logger = LogProvider.create('core').logger('storeWrapper');

    /**
     *
     */
    constructor(store: StoreMap | object | null, storeName: string) {
        super();

        if (!store) {
            this.store = new ObjectWrapper({});
        } else if (typeof store === 'object' && store.constructor.name === 'Object') {
            this.store = new ObjectWrapper(store);
        } else {
            this.store = store as StoreMap;
        }
        this.storeName = storeName;
    }

    /**
     *
     */
    clear() {
        this.store.clear();
    }

    /**
     *
     */
    put(ast: ValueReplaceArg | string, value: ContentType): void {
        if (typeof ast === 'string') {
            throw 'not implemented anymore';
        }

        if (!ast.selectors?.length) {
            const contentValue = DataContentHelper.create(value);
            this.store.put(ast, contentValue);
        } else {
            const storeValue = this.store.get(ast);
            const storeContentValue = !storeValue ? new ObjectContent() : DataContentHelper.create(storeValue);

            const contentValue = SelectorExtractor.setValueBySelector(ast.selectors, value, storeContentValue);
            this.store.put(ast, contentValue);
        }
    }

    /**
     *
     */
    get(ast: ValueReplaceArg | string): ContentType {
        if (typeof ast === 'string') {
            throw 'not implemented anymore';
        }

        const storeValue = this.store.get(ast);
        if (storeValue == null) {
            return null;
        }

        try {
            const dataContentValue = DataContentHelper.create(storeValue);
            const value = SelectorExtractor.getValueBySelector(ast.selectors, dataContentValue);

            this.logger.trace(
                () => `get ${ast.selectors.match || ''}`,
                () => value
            );
            return value;
        } catch (error) {
            throw new Error(`store '${this.getKey(ast)}' -> ${(<Error>error).message}`);
        }
    }

    /**
     *
     */
    has(ast: ValueReplaceArg): boolean {
        const storeValue = this.store.get(ast);
        if (storeValue == null) {
            return false;
        } else {
            const dataContentValue = DataContentHelper.create(storeValue);
            return SelectorExtractor.hasValueBySelector(ast.selectors, dataContentValue);
        }
    }

    /**
     *
     */
    static getWrapperByScope(scope: string): StoreWrapper {
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
}
