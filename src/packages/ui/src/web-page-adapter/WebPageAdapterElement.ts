import { ElementAdapter } from '../element-adapter/ElementAdapter';
import { WebPageAdapter } from './WebPageAdapter';
import { WebPageAdapterElementLocator } from './WebPageAdapterElementLocator';

/**
 *
 */
export interface WebPageAdapterElement<T> {
    readonly webDriverAdapter: WebPageAdapter<T>;
    /**
     *
     */
    byId(location: string, parentElement: ElementAdapter, index?: number): Promise<ElementAdapter>;

    /**
     *
     */
    readonly locator: WebPageAdapterElementLocator;

    /**
     *
     */
    setValue(value: string, location: string, element: ElementAdapter): Promise<void>;

    // /**
    //  *
    //  */
    // setControlValue(value: string, location: string, element: ElementProxy): Promise<void>;

    /**
     *
     */
    click(location: string, element: ElementAdapter): Promise<void>;
}
