import { ContentType } from '../data/ContentType';
import { DataContentHelper } from '../data/DataContentHelper';

import { Store } from './Store';
import { StoreMap } from './StoreMap';
import { StoreWrapper } from './StoreWrapper';

/**
 * Uses Execution Context
 * or value by Context.put
 */
export class Context implements StoreMap {
    private static readonly Key = ':#:context:#:';
    private context: object = {};
    private contextMap = new StoreWrapper({}, 'context');

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
    setContext(context: object): void {
        this.context = context;
    }

    /**
     *
     */
    put(key: string, value: ContentType): void {
        this.contextMap.put(key, value);
    }

    /**
     *
     */
    get(key: string): ContentType {
        // try context value...
        const context = DataContentHelper.create(this.context);
        const contextValue = DataContentHelper.getByPath(key, context, true);

        if (contextValue.isNullOrUndefined()) {
            // ...if context not exists, try map value
            return this.contextMap.get(key, true);
        }
        return contextValue;
    }

    /**
     *
     */
    has(key: string): boolean {
        // try context value...
        const context = DataContentHelper.create(this.context);

        if (!DataContentHelper.hasPath(key, context)) {
            // ...if context not exists, try map value
            return this.contextMap.has(key);
        }
        return true;
    }

    /**
     *
     */
    clear(): void {
        this.contextMap.clear();
    }
}
