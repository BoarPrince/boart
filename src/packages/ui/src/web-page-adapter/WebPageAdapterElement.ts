import { ElementProxy } from '../element-proxy/ElementProxy';
import { WebPageAdapter } from './WebPageAdapter';
import { WebPageAdapterElementLocator } from './WebPageAdapterElementLocator';

/**
 *
 */
export interface WebPageAdapterElement {
    readonly webDriverAdapter: WebPageAdapter;
    /**
     *
     */
    byId(location: string, parentElement: ElementProxy, index?: number): Promise<ElementProxy>;

    /**
     *
     */
    readonly locator: WebPageAdapterElementLocator;

    /**
     *
     */
    setValue(value: string, location: string, element: ElementProxy): Promise<void>;

    // /**
    //  *
    //  */
    // setControlValue(value: string, location: string, element: ElementProxy): Promise<void>;

    /**
     *
     */
    click(location: string, element: ElementProxy): Promise<void>;
}
