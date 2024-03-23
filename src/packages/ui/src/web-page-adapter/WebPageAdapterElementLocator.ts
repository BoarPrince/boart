import { ElementAdapter } from '../element-adapter/ElementAdapter';
import { ElementAdapterLocatorHandler } from '../element-adapter/ElementAdapterLocatorHandler';

/**
 *
 */
export abstract class WebPageAdapterElementLocator {
    /**
     *
     */
    protected abstract getElement(parentElement: ElementAdapter): ElementAdapter;

    /**
     *
     */
    public async find(location: string, parentElement?: ElementAdapter, index?: number): Promise<ElementAdapter> {
        const locators = ElementAdapterLocatorHandler.instance.getAll();
        for (const locator of locators) {
            const element = await locator.findOptionalBy(location, parentElement, index);
            if (element) {
                return element;
            }
        }

        return Promise.reject(`element with location: '${location}' not found!`);
    }

    /**
     *
     */
    public async findBy(strategy: string, location: string, parentElement?: ElementAdapter, index?: number): Promise<ElementAdapter> {
        const element = await this.findOptionalBy(strategy, location, parentElement, index);
        return element ? element : Promise.reject(`element with strategy: '${strategy}' and location: '${location}' not found!`);
    }

    /**
     *
     */
    public async findOptionalBy(
        strategy: string,
        location: string,
        parentElement?: ElementAdapter,
        index?: number
    ): Promise<ElementAdapter> {
        const locators = ElementAdapterLocatorHandler.instance.getLocators(strategy);
        for (const locator of locators) {
            const element = await locator.findBy(location, this.getElement(parentElement), index);
            if (element) {
                return element;
            }
        }

        return null;
    }

    /**
     *
     */
    async all(parentElement: ElementAdapter): Promise<ElementAdapter[]> {
        const element = this.getElement(parentElement);
        const elements = new Array<ElementAdapter>();
        for (const locator of ElementAdapterLocatorHandler.instance.getAll()) {
            const proxies = await locator.all(element);
            elements.push(...proxies);
        }
        return elements;
    }
}
