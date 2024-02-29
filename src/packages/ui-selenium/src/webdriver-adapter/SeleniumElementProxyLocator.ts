import { ElementProxy, ElementProxyLocatorHandler } from '@boart/ui';
import { SeleniumWebDriver } from './SeleniumWebDriver';
import { SeleniumElementLocatorProxy } from '../element-proxy/SeleniumElementLocatorProxy';
import { SeleniumElementProxy } from '../element-proxy/SeleniumElementProxy';

/**
 *
 */
export class SeleniumElementProxyLocator {
    /**
     *
     */
    constructor(private driver: SeleniumWebDriver) {}

    /**
     *
     */
    private getElement(parentElement: ElementProxy): ElementProxy {
        return !parentElement ? new SeleniumElementLocatorProxy(this.driver.nativeDriver) : parentElement;
    }

    /**
     *
     */
    public async findBy(strategy: string, location: string, parentElement?: ElementProxy, index?: number): Promise<ElementProxy> {
        const element = await this.findOptionalBy(strategy, location, parentElement, index);
        return element ? element : Promise.reject(`element with strategy: '${strategy}' and location: '${location}' not found!`);
    }

    /**
     *
     */
    findOptionalBy(strategy: string, location: string, parentElement?: ElementProxy, index?: number): Promise<ElementProxy> {
        const locator = ElementProxyLocatorHandler.instance.findLocator(strategy);
        return locator.findBy(location, this.getElement(parentElement), index);
    }

    /**
     *
     */
    async all(parentElement: SeleniumElementProxy): Promise<ElementProxy[]> {
        const element = this.getElement(parentElement);
        const elements = new Array<ElementProxy>();
        for (const locator of ElementProxyLocatorHandler.instance.getAll()) {
            const proxies = await locator.all(element);
            elements.push(...proxies);
        }
        return elements;
    }
}
