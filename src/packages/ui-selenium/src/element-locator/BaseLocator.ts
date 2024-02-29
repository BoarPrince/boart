import { WebElement } from 'selenium-webdriver';
import { ElementProxyLocator } from '@boart/ui';
import { SeleniumElementProxy } from '../element-proxy/SeleniumElementProxy';
import { SeleniumElementLocatorProxy } from '../element-proxy/SeleniumElementLocatorProxy';

/**
 *
 */
export abstract class BaseLocator implements ElementProxyLocator {
    abstract readonly strategy;
    abstract strategyCanBeNull: boolean;

    /**
     *
     */
    abstract find(locationByStrategy: string, parentElement: SeleniumElementLocatorProxy): Promise<WebElement[]>;

    /**
     *
     */
    abstract findAll(parentElement: SeleniumElementLocatorProxy): Promise<WebElement[]>;

    /**
     *
     */
    async findOptionalBy(locationByStrategy: string, parentElement: SeleniumElementLocatorProxy, index = 0): Promise<SeleniumElementProxy> {
        try {
            const element = await this.find(locationByStrategy, parentElement);
            return new SeleniumElementProxy(element[index]);
        } catch (error) {
            return null;
        }
    }

    /**
     *
     */
    async findBy(locationByStrategy: string, parentElement: SeleniumElementLocatorProxy, index = 0): Promise<SeleniumElementProxy> {
        try {
            const element = await this.find(locationByStrategy, parentElement);
            return new SeleniumElementProxy(element[index]);
        } catch (error) {
            throw new Error(`element with id = '${locationByStrategy}' by strategy findBy:'${this.strategy}' not found!`);
        }
    }

    /**
     *
     */
    async all(parentElement: SeleniumElementProxy): Promise<SeleniumElementProxy[]> {
        const elements = (await this.findAll(parentElement)) || [];
        return elements.map((element) => new SeleniumElementProxy(element));
    }
}
