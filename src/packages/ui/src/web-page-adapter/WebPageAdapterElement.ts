import { ElementAdapter } from '../element-adapter/ElementAdapter';
import { UIElementProxy } from '../ui-element-proxy/UIElementProxy';
import { UIElementProxyInfo } from '../ui-element-proxy/UIElementProxyInfo';
import { ElementPosition } from '../ui-element-proxy/ElementPosition';
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
    byId(location: string, parentElement?: ElementAdapter, index?: number): Promise<ElementAdapter>;

    /**
     *
     */
    getProxy(element: ElementAdapter): Promise<UIElementProxy>;

    /**
     *
     */
    getElementInfo(element: ElementAdapter, position?: ElementPosition): Promise<UIElementProxyInfo>;

    /**
     *
     */
    readonly locator: WebPageAdapterElementLocator;

    /**
     *
     */
    setValue(value: string, element: ElementAdapter, position?: ElementPosition): Promise<void>;

    // /**
    //  *
    //  */
    // setControlValue(value: string, location: string, element: ElementProxy): Promise<void>;

    /**
     *
     */
    click(element: ElementAdapter, position?: ElementPosition): Promise<void>;
}
