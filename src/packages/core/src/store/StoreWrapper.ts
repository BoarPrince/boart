import { ContentType } from '../data/ContentType';
import { DataContent } from '../data/DataContent';
import { DataContentHelper } from '../data/DataContentHelper';
import { ObjectContent } from '../data/ObjectContent';
import { SelectorExtractor } from '../data/SelectorExtractor';
import { LogProvider } from '../logging/LogProvider';
import { ScopeType } from '../types/ScopeType';
import { PropertyParser } from '../value/PropertyParser';
import { ValueReplaceArg } from '../value/ValueReplacer';

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
    has = (key: string) => Object.keys(this.map).includes(key);

    /**
     *
     */
    clear = () => (this.map = {});
}

/**
 *
 */
export class StoreWrapper implements StoreMap {
    public readonly store: StoreMap;
    public readonly storeName: string;
    private readonly logger = LogProvider.create('core').logger('storeWrapper');

    /**
     *
     */
    constructor(store: StoreMap | object | null, storeName: string) {
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
        this.logger.trace(
            () => `put ${key}`,
            () => value
        );
        const properties = PropertyParser.parseProperty(key);

        if (properties.length === 0) {
            throw Error('name must be defined for saving value in storage');
        }

        if (properties.length > 1) {
            const nativeContentValue = this.store.get(properties.first().key);
            let contentValue = nativeContentValue != null ? DataContentHelper.create(nativeContentValue) : new ObjectContent();

            contentValue = DataContentHelper.setByPath(properties.nofirst(), value, contentValue);
            this.store.put(properties.first().key, contentValue);
        } else {
            const contentValue = DataContentHelper.create(value);
            this.store.put(key, contentValue);
        }
    }

    /**
     *
     */
    getByAst(arg: ValueReplaceArg): ContentType {
        const contentValue = this.store.get(arg.qualifier.value);
        if (contentValue == null) {
            return null;
        }

        const dataContentValue = DataContentHelper.create(contentValue);
        const value = SelectorExtractor.getValueBySelector(arg.selectors, dataContentValue);

        this.logger.trace(
            () => `get ${arg.selectors.match || ''}`,
            () => value
        );
        return value;
    }

    /**
     *
     */
    get(key: string, optional = false): ContentType {
        const properties = PropertyParser.parseProperty(key);

        if (properties.length === 0) {
            throw Error('name must be defined for getting value from storage');
        }

        const contentValue = this.store.get(properties.first().key);
        if (contentValue == null) {
            return null;
        }

        const dataContentValue = DataContentHelper.create(contentValue);
        const value = DataContentHelper.getByPath(properties.nofirst(), dataContentValue, optional);
        this.logger.trace(
            () => `get ${key}`,
            () => value
        );
        return value;
    }

    /**
     *
     */
    has(key: string): boolean {
        const properties = PropertyParser.parseProperty(key);

        if (properties.length === 0) {
            return false;
        }

        if (!this.store.has(properties.first().key)) {
            return false;
        }

        const contentValue = this.store.get(properties.first().key);
        const dataContentValue = DataContentHelper.create(contentValue);
        return !DataContentHelper.getByPath(properties.nofirst(), dataContentValue, true).isNullOrUndefined();
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
