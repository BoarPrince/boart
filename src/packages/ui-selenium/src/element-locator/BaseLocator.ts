import { WebElement } from 'selenium-webdriver';
import { ElementAdapter, ElementAdapterLocator } from '@boart/ui';
import { SeleniumElementAdapter } from '../element-adapter/SeleniumElementAdapter';
import { SeleniumElementLocatorAdapter } from '../element-adapter/SeleniumElementLocatorAdapter';

/**
 *
 */
export abstract class BaseLocator implements ElementAdapterLocator {
    abstract readonly priority: number;
    abstract readonly strategy: string;
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
    abstract getId(parentElement: ElementAdapter): Promise<string>;

    /**
     *
     */
    async findOptionalBy(
        locationByStrategy: string,
        parentElement: SeleniumElementLocatorAdapter,
        index = 0
    ): Promise<SeleniumElementAdapter> {
        const element = await this.find(locationByStrategy, parentElement);
        if (element?.length === 0) {
            return null;
        } else if (element.length < index) {
            return null;
        } else {
            return new SeleniumElementAdapter(element[index], `${this.strategy}:${locationByStrategy}`);
        }
    }

    /**
     *
     */
    async findBy(locationByStrategy: string, parentElement: SeleniumElementLocatorAdapter, index = 0): Promise<SeleniumElementAdapter> {
        try {
            const element = await this.find(locationByStrategy, parentElement);
            if (element?.length === 0) {
                throw new Error(`not found`);
            } else if (element.length < index) {
                throw new Error(`element only have ${element.length} elements, but you want to get ${index}`);
            } else {
                return new SeleniumElementAdapter(element[index], `${this.strategy}:${locationByStrategy}`);
            }
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            error.message = `element '${locationByStrategy}' by strategy findBy:${this.strategy} not found!\n` + error.message;
            throw error;
        }
    }

    /**
     *
     */
    async all(parentElement: SeleniumElementAdapter): Promise<SeleniumElementAdapter[]> {
        const elements = (await this.findAll(parentElement)) || [];
        const elementAdapters = new Array<SeleniumElementAdapter>();

        for (const element of elements) {
            // adapter is only needed for getting the id
            const adapter = new SeleniumElementAdapter(element, null);
            const id = await adapter.getLocation();
            elementAdapters.push(new SeleniumElementAdapter(element, `${this.strategy}:${id}`));
        }

        return elementAdapters;
    }
}
