import { ContentType } from '../data/ContentType';
import { DataContent } from '../data/DataContent';
import { DataContentHelper } from '../data/DataContentHelper';
import { ObjectContent } from '../data/ObjectContent';

import { Store } from './Store';
import { StoreMap } from './StoreMap';
import { StoreWrapper } from './StoreWrapper';

/**
 * Uses Execution Context
 * or value by Context.put
 */
export class Context implements StoreMap {
    private static readonly Key = ':#:context:#:';
    private context: DataContent = new ObjectContent();
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
        this.context = DataContentHelper.create(context);
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
        // try context value
        const contextValue = DataContentHelper.getByPath(key, this.context, true);
        if (contextValue.isNullOrUndefined()) {
            // if context not exists, try map value
            return this.contextMap.get(key, true);
        }
        return contextValue;
    }

    /**
     *
     */
    clear(): void {
        this.contextMap.clear();
    }
}
