/**
 *
 */
import { StepStore } from './StepStore';
import { StoreMap } from './StoreMap';
import { StoreWrapper } from './StoreWrapper';

/**
 *
 */
export class Store {
    private _globalStore = new StoreWrapper({}, 'global store');
    private _localStore = new StoreWrapper({}, 'local store');
    private _testStore = new StoreWrapper({}, 'test store');
    private _stepStore = new StoreWrapper(new StepStore(), 'step store');

    /**
     *
     */
    private constructor() {
        // declare private constructor, because it's a singleton.
    }

    /**
     *
     */
    static get instance(): Store {
        if (!globalThis._storeInstance) {
            globalThis._storeInstance = new Store();
        }
        return globalThis._storeInstance;
    }

    /**
     *
     */
    get testStore(): StoreWrapper {
        return this._testStore;
    }

    /**
     *
     */
    get localStore(): StoreWrapper {
        return this._localStore;
    }

    /**
     *
     */
    get globalStore(): StoreWrapper {
        return this._globalStore;
    }

    /**
     *
     */
    get stepStore(): StoreWrapper {
        return this._stepStore;
    }

    /**
     *
     */
    initGlobalStore(store: StoreMap | object): void {
        this._globalStore = new StoreWrapper(store, 'global store, init');
    }

    /**
     *
     */
    initLocalStore(store: StoreMap | object): void {
        this._localStore = new StoreWrapper(store, 'local store, init');
    }

    /**
     *
     */
    initTestStore(store: StoreMap | object): void {
        this._testStore = new StoreWrapper(store, 'test store, init');
    }
}
