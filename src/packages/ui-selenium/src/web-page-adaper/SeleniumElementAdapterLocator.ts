import { ElementAdapter, WebDriverAdapter, WebPageAdapterElementLocator } from '@boart/ui';
import { SeleniumElementLocatorAdapter } from '../element-adapter/SeleniumElementLocatorAdapter';
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
        return !parentElement ? new SeleniumElementLocatorAdapter(this.driver.nativeDriver) : parentElement;
    }
}
