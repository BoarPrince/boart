import { ElementProxy } from '../element-proxy/ElementProxy';
import { ElementProxyLocator } from '../element-proxy/ElementProxyLocator';

/**
 *
 */
export interface WebDriverAdapterElement {
    /**
     *
     */
    byId(location: string, parentElement: ElementProxy, index?: number): Promise<ElementProxy>;

    /**
     *
     */
    readonly locator: {
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
    };

    /**
     *
     */
    exists(location: string): Promise<boolean>;
    /**
     *
     */
    getActive(location: string): Promise<ElementProxy>;
    /**
     *
     */
    setValue(value: string, location: string, element: ElementProxy): Promise<void>;
    /**
     *
     */
    setControlValue(value: string, location: string, element: ElementProxy): Promise<void>;
    /**
     *
     */
    click(location: string, element: ElementProxy): Promise<void>;
}
