import { ElementAdapter, WebDriverAdapter, WebPageAdapterElementLocator } from '@boart/ui';
import { SeleniumElementLocatorProxy } from '../element-proxy/SeleniumElementLocatorProxy';
import { WebDriver } from 'selenium-webdriver';

/**
 *
 */
export class SeleniumElementAdapterLocator extends WebPageAdapterElementLocator {
    /**
     *
     */
    constructor(private driver: WebDriverAdapter<WebDriver>) {
        super();
    }

    /**
     *
     */
    protected getElement(parentElement: ElementAdapter): ElementAdapter {
        return !parentElement ? new SeleniumElementLocatorProxy(this.driver.nativeDriver) : parentElement;
    }
}
