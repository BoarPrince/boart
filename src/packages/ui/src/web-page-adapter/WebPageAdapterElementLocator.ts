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
    public async findBy(strategy: string, location: string, parentElement?: ElementAdapter, index?: number): Promise<ElementAdapter> {
        const element = await this.findOptionalBy(strategy, location, parentElement, index);
        return element ? element : Promise.reject(`element with strategy: '${strategy}' and location: '${location}' not found!`);
    }

    /**
     *
     */
    public findOptionalBy(strategy: string, location: string, parentElement?: ElementAdapter, index?: number): Promise<ElementAdapter> {
        const locator = ElementAdapterLocatorHandler.instance.findLocator(strategy);
        return locator.findBy(location, this.getElement(parentElement), index);
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
