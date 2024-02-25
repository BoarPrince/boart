import { ElementProxy } from '@boart/ui';
import { WebDriverAdapterElement } from '@boart/ui/lib/webdriver/WebDriverAdapterElement';
import { SeleniumWebDriver } from './SeleniumWebDriver';
import { SeleniumElementProxyLocator } from './SeleniumElementProxyLocator';
import { SeleniumElementProxy } from '../element-proxy/SeleniumElementProxy';

/**
 *
 */
export class SeleniumWebDriverAdapterElement implements WebDriverAdapterElement {
    /**
     *
     */
    constructor(private driver: SeleniumWebDriver) {
        this.locator = new SeleniumElementProxyLocator(this.driver);
    }

    /**
     *
     */
    public async byId(location: string, parentElement?: SeleniumElementProxy, index?: number): Promise<ElementProxy> {
        return this.locator.findBy('id', location, parentElement, index);
    }

    /**
     *
     */
    readonly locator: SeleniumElementProxyLocator;

    /**
     *
     */
    exists(location: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    /**
     *
     */
    getActive(location: string): Promise<ElementProxy> {
        throw new Error('Method not implemented.');
    }

    /**
     *
     */
    setValue(value: string, location: string, element: ElementProxy): Promise<void> {
        throw new Error('Method not implemented.');
    }

    /**
     *
     */
    setControlValue(value: string, location: string, element: ElementProxy): Promise<void> {
        throw new Error('Method not implemented.');
    }

    /**
     *
     */
    click(location: string, element: ElementProxy): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
