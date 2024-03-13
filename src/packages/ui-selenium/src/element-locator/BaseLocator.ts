import { WebElement } from 'selenium-webdriver';
import { ElementAdapterLocator } from '@boart/ui';
import { SeleniumElementAdapter } from '../element-adapter/SeleniumElementAdapter';
import { SeleniumElementLocatorAdapter } from '../element-adapter/SeleniumElementLocatorAdapter';

/**
 *
 */
export abstract class BaseLocator implements ElementAdapterLocator {
    abstract readonly strategy;
    abstract strategyCanBeNull: boolean;

    /**
     *
     */
    abstract find(locationByStrategy: string, parentElement: SeleniumElementLocatorAdapter): Promise<WebElement[]>;

    /**
     *
     */
    abstract findAll(parentElement: SeleniumElementLocatorAdapter): Promise<WebElement[]>;

    /**
     *
     */
    async findOptionalBy(
        locationByStrategy: string,
        parentElement: SeleniumElementLocatorAdapter,
        index = 0
    ): Promise<SeleniumElementAdapter> {
        try {
            const element = await this.find(locationByStrategy, parentElement);
            return new SeleniumElementAdapter(element[index]);
        } catch (error) {
            return null;
        }
    }

    /**
     *
     */
    async findBy(locationByStrategy: string, parentElement: SeleniumElementLocatorAdapter, index = 0): Promise<SeleniumElementAdapter> {
        try {
            const element = await this.find(locationByStrategy, parentElement);
            return new SeleniumElementAdapter(element[index]);
        } catch (error) {
            throw new Error(`element with id = '${locationByStrategy}' by strategy findBy:'${this.strategy}' not found!`);
        }
    }

    /**
     *
     */
    async all(parentElement: SeleniumElementAdapter): Promise<SeleniumElementAdapter[]> {
        const elements = (await this.findAll(parentElement)) || [];
        return elements.map((element) => new SeleniumElementAdapter(element));
    }
}
