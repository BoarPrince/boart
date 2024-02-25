import { ElementProxy } from './ElementProxy';

/**
 *
 */

export interface ElementProxyLocator {
    readonly strategy: string;
    readonly strategyCanBeNull: boolean;

    /**
     *
     */
    findBy(locationByStrategy: string, parentElement: ElementProxy, index?: number): Promise<ElementProxy>;

    /**
     *
     */
    findOptionalBy(locationByStrategy: string, parentElement: ElementProxy, index?: number): Promise<ElementProxy> | null;

    /**
     *
     */
    all(parentElement: ElementProxy): Promise<ElementProxy[]> | null;
}
