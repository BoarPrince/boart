import { DescriptionHandler } from '../description/DescriptionHandler';

import { TableHandler } from './TableHandler';

/**
 *
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TableHandlerGenericType = TableHandler<any, any>;

/**
 *
 */
export class TableHandlerInstances {
    private instanceList = new Map<string, TableHandlerGenericType>();
    /**
     *
     */
    private constructor() {
        // singleton
    }

    /**
     *
     */
    public static get instance(): TableHandlerInstances {
        if (!globalThis._tableHandlerInstances) {
            globalThis._tableHandlerInstances = new TableHandlerInstances();
        }
        return globalThis._tableHandlerInstances;
    }

    /**
     *
     */
    public add(tableHandler: TableHandlerGenericType, name: string): void {
        this.instanceList.set(name, tableHandler);
    }

    /**
     *
     */
    public get values(): IterableIterator<[string, TableHandlerGenericType]> {
        return this.instanceList.entries();
    }
}
