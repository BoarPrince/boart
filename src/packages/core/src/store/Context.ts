import { ContentType } from '../data/ContentType';
import { DataContentHelper } from '../data/DataContentHelper';

import { Store } from './Store';
import { StoreMap } from './StoreMap';

/**
 *
 */
export class Context implements StoreMap {
    private static readonly Key = ':#:context:#:';
    private contextMap = new Map<string, ContentType>();

    /***
     *
     */
    private constructor() {
        // singleton
    }

    /**
     *
     */
    public static get instance(): Context {
        let instance = Store.instance.stepStore.store.get(Context.Key) as Context;
        if (!instance) {
            instance = new Context();
            Store.instance.stepStore.store.put(Context.Key, instance);
        }
        return instance;
    }

    /**
     *
     */
    put(key: string, value: ContentType): void {
        this.contextMap.set(key, value);
    }

    /**
     *
     */
    get(key: string): ContentType {
        return DataContentHelper.create(this.contextMap.get(key));
    }

    /**
     *
     */
    clear(): void {
        this.contextMap.clear();
    }
}
