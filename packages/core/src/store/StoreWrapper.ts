import { ContentType } from '../data/ContentType';
import { DataContent } from '../data/DataContent';
import { DataContentHelper } from '../data/DataContentHelper';

import { StoreMap } from './StoreMap';


/**
 *
 */
export class StoreWrapper {
    private readonly _store: StoreMap;
    private readonly _storeName: string;

    /**
     *
     */
    constructor(store: StoreMap, storeName: string) {
        this._store = store;
        this._storeName = storeName;
    }

    /**
     *
     */
    get store(): StoreMap {
        return this._store;
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
            const contentValue = DataContentHelper.create();
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
}
