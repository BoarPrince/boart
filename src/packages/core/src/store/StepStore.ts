import { DataContent } from '../data/DataContent';
import { Runtime } from '../runtime/Runtime';

import { StoreMap } from './StoreMap';

/**
 *
 */
export class StepStore implements StoreMap {
    private readonly store: Map<string, DataContent | string>;

    /**
     *
     */
    constructor() {
        this.store = new Map<string, DataContent | string>();

        Runtime.instance.stepRuntime.onStart().subscribe(() => {
            this.clear();
        });
    }

    /**
     *
     */
    get(key: string): DataContent {
        return this.store.get(key) as DataContent;
    }

    /**
     *
     */
    put(key: string, value: DataContent | string): ReadonlyMap<string, DataContent | string> {
        return this.store.set(key, value);
    }

    /**
     *
     */
    clear() {
        this.store.clear();
    }
}
