import { ContentType } from '../data/ContentType';
import { DataContent } from '../data/DataContent';
import { DataContentHelper } from '../data/DataContentHelper';
import { ScopeType } from '../types/ScopeType';

import { Store } from './Store';
import { StoreMap } from './StoreMap';

/**
 *
 */
class ObjectWrapper implements StoreMap {
    /**
     *
     */
    constructor(private map: object) {}

    /**
     *
     */
    put = (key: string, value: DataContent) => (this.map[key] = value);

    /**
     *
     */
    get = (key: string) => this.map[key] as DataContent;

    /**
     *
     */
    clear = () => (this.map = {});
}

/**
 *
 */
export class StoreWrapper {
    public readonly store: StoreMap;
    public readonly storeName: string;

    /**
     *
     */
    constructor(store: StoreMap | object, storeName: string) {
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
    put(key: string, value: ContentType) {
        const keys = DataContentHelper.splitKeys(key);
        if (keys.length === 0) {
            throw Error('name must be defined for saving value in storage');
        }

        if (keys.length > 1) {
            const firstKey = keys.shift();
            const contentValue = DataContentHelper.create(this.store.get(firstKey));
            DataContentHelper.setByPath(keys, value, contentValue);
            this.store.put(firstKey, contentValue);
        } else {
            const contentValue = DataContentHelper.create(value);
            this.store.put(key, contentValue);
        }
    }

    /**
     *
     */
    get(key: string): DataContent {
        const keys = DataContentHelper.splitKeys(key);
        if (keys.length === 0) {
            throw Error('name must be defined for getting value from storage');
        }

        const firstKey = keys.shift();
        const contentValue = this.store.get(firstKey);

        if (contentValue === undefined || contentValue === null) {
            throw Error(`getting "${key}" not possible, because it does not exist`);
        }

        if (keys.length > 0) {
            try {
                return DataContentHelper.getByPath(keys, contentValue);
            } catch (error) {
                throw Error(`getting "${key}" not possible, because it's not an object or an array`);
            }
        } else {
            return contentValue;
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
