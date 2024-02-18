import { DataContent } from '../data/DataContent';
import { Runtime } from '../runtime/RuntimeNotifier';
import { ValueReplaceArg } from '../value/ValueReplacer';

import { StoreMap } from './StoreMap';

/**
 *
 */
export class StepStore extends StoreMap {
    private readonly store: Map<string, DataContent | string>;

    /**
     *
     */
    constructor() {
        super();

        this.store = new Map<string, DataContent | string>();
        Runtime.instance.stepRuntime.onStart().subscribe(() => {
            this.clear();
        });
    }

    /**
     *
     */
    get(ast: ValueReplaceArg): DataContent {
        return this.store.get(this.getKey(ast)) as DataContent;
    }

    /**
     *
     */
    has(ast: ValueReplaceArg): boolean {
        return this.store.has(this.getKey(ast));
    }

    /**
     *
     */
    put(ast: ValueReplaceArg, value: DataContent | string): ReadonlyMap<string, DataContent | string> {
        return this.store.set(this.getKey(ast), value);
    }

    /**
     *
     */
    clear() {
        this.store.clear();
    }
}
