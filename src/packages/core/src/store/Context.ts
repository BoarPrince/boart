import { ContentType } from '../data/ContentType';
import { DataContentHelper } from '../data/DataContentHelper';
import { SelectorExtractor } from '../data/SelectorExtractor';
import { ValueReplaceArg } from '../value/ValueReplacer';

import { Store } from './Store';
import { StoreMap } from './StoreMap';
import { StoreWrapper } from './StoreWrapper';

/**
 * Uses Execution Context
 * or value by Context.put
 */
export class Context extends StoreMap {
    private static readonly Key = StoreMap.getStoreIdentifier(':#:context:#:');
    private context: object = {};
    private contextMap = new StoreWrapper({}, 'context');

    /***
     *
     */
    private constructor() {
        super();
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
    put(ast: ValueReplaceArg | string, value: ContentType): void {
        this.contextMap.put(ast, value);
    }

    /**
     *
     */
    get(ast: ValueReplaceArg | string): ContentType {
        if (typeof ast === 'string') {
            throw 'not implemented anymore';
        } else {
            return this.getByAst(ast);
        }
    }

    /**
     *
     */
    private getByAst(ast: ValueReplaceArg): ContentType {
        // try context value...
        const context = DataContentHelper.create(this.context).asDataContentObject();

        // e.g. read context:payload#id -> get the 'payload'
        const storeName = this.getKey(ast);
        const storeValue = context.get(storeName);

        ast.selectors.forEach((sel) => (sel.optional = true));
        const contextValue = SelectorExtractor.getValueByAst(ast, storeValue);

        if (!contextValue?.isNullOrUndefined()) {
            // ...if context not exists, try map value
            return contextValue;
        }
        return this.contextMap.get(ast);
    }

    /**
     *
     */
    has(ast: ValueReplaceArg): boolean {
        // try context value...
        const context = DataContentHelper.create(this.context);

        if (!SelectorExtractor.hasValueBySelector(ast.selectors, context)) {
            // ...if context not exists, try map value
            return this.contextMap.has(ast);
        }
        return true;
    }

    /**
     *
     */
    clear(): void {
        this.contextMap.clear();
        this.context = {};
    }
}
