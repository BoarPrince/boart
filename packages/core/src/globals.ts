import { StoreMap } from './store/StoreMap';
import 'jest-extended';

// an import is required, or else the global keyword does not work
declare global {
    /**
     *
     */
    interface Gauge<T> {
        readonly dataStore: {
            readonly suiteStore: StoreMap;
            readonly specStore: StoreMap;
            readonly scenarioStore: StoreMap;
        };
        readonly message: (text: string) => void;
    }

    /**
     *
     */
    const gauge: Gauge<any>;
}
