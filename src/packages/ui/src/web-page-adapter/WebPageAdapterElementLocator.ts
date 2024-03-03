import { ElementProxy } from '../element-proxy/ElementProxy';

/**
 *
 */
export interface WebPageAdapterElementLocator {
    /**
     *
     */
    findBy(strategy: string, location: string, parentElement?: ElementProxy, index?: number): Promise<ElementProxy>;

    /**
     *
     */
    findOptionalBy(strategy: string, location: string, parentElement?: ElementProxy, index?: number): Promise<ElementProxy>;

    /**
     *
     */
    all(parentElement: ElementProxy): Promise<ElementProxy[]>;
}
