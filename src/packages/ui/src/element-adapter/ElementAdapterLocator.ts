import { ElementAdapter } from './ElementAdapter';

/**
 *
 */

export interface ElementAdapterLocator {
    readonly priority: number;
    readonly strategy: string;
    readonly strategyCanBeNull: boolean;

    /**
     *
     */
    getId(parentElement: ElementAdapter): Promise<string>;

    /**
     *
     */
    findBy(locationByStrategy: string, parentElement: ElementAdapter, index?: number): Promise<ElementAdapter>;

    /**
     *
     */
    findOptionalBy(locationByStrategy: string, parentElement: ElementAdapter, index?: number): Promise<ElementAdapter> | null;

    /**
     *
     */
    all(parentElement: ElementAdapter): Promise<ElementAdapter[]> | null;
}
