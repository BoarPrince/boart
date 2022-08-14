/**
 *
 */
import { StepStore } from './StepStore';
import { StoreWrapper } from './StoreWrapper';

/**
 *
 */
export class Store {
    private readonly _globalStore = new StoreWrapper(gauge.dataStore.suiteStore, 'global store');
    private readonly _localStore = new StoreWrapper(gauge.dataStore.specStore, 'local store');
    private readonly _testStore = new StoreWrapper(gauge.dataStore.scenarioStore, 'test store');
    private readonly _stepStore = new StoreWrapper(new StepStore(), 'step store');

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
}
