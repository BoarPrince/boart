import { DataContent } from '../data/DataContent';

import { StoreMap } from './StoreMap';

/**
 *
 */
export class StepStore implements StoreMap {
    /**
     *
     */
    private stepContext = {
        stepStore: new Map<string, DataContent | string>()
    };

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    changeContext(stepContext: any): void {
        this.stepContext.stepStore = null;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.stepContext = stepContext;
        this.stepContext.stepStore = new Map();
    }

    /**
     *
     */
    get(key: string): DataContent {
        return this.stepContext.stepStore.get(key) as DataContent;
    }

    /**
     *
     */
    put(key: string, value: DataContent | string): ReadonlyMap<string, DataContent | string> {
        return this.stepContext.stepStore.set(key, value);
    }

    /**
     *
     */
    clear() {
        this.stepContext.stepStore.clear();
    }
}
