import { ElementAdapter } from '../element-adapter/ElementAdapter';
import { UIElementProxy } from '../ui-element-proxy/UIElementProxy';
import { UIElementProxyHandler } from '../ui-element-proxy/UIElementProxyHandler';
import { WebDriverAdapter } from '../web-driver/WebDriverAdapter';
import { WebPageAdapter } from './WebPageAdapter';
import { WebPageAdapterElement } from './WebPageAdapterElement';
import { WebPageAdapterElementLocator } from './WebPageAdapterElementLocator';

/**
 *
 */
export class WebPageAdapterElementDefault<T> implements WebPageAdapterElement<T> {
    /**
     *
     */
    constructor(
        private driver: WebDriverAdapter<T>,
        public readonly webDriverAdapter: WebPageAdapter<T>,
        public readonly locator: WebPageAdapterElementLocator
    ) {}

    /**
     *
     */
    public async byId(location: string, parentElement?: ElementAdapter, index?: number): Promise<ElementAdapter> {
        return this.locator.findBy('id', location, parentElement, index);
    }

    /**
     *
     */
    private async getProxyAndCheckAccessibility(element: ElementAdapter, location: string): Promise<UIElementProxy> {
        const proxy = await UIElementProxyHandler.instance.getProxy(element);
        const tagName = await element.getTagName();

        if (!proxy) {
            throw new Error(`elements are nots supported with tagName: '${tagName}'`);
        }

        if (!(await proxy.isDisplayed(element)) || !(await proxy.isEnabled(element))) {
            throw new Error(`element location: '${location}', tagName: '${tagName}' is not visible or not enabled`);
        }

        return proxy;
    }

    /**
     *
     */
    async setValue(value: string, location: string, element: ElementAdapter): Promise<void> {
        await this.webDriverAdapter.progessWaiting();

        const proxy = await this.getProxyAndCheckAccessibility(element, location);
        const tagName = await element.getTagName();

        try {
            await proxy.setValue(value, element);
            await this.webDriverAdapter.driver.requestFocus(element);
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            throw new Error(`set value is not supported for '${location}', tagName: '${tagName}'\n${error.message}`);
        }

        await this.webDriverAdapter.progessWaiting();
        await this.webDriverAdapter.errorChecking();
    }

    /**
     *
     */
    async click(location: string, element: ElementAdapter): Promise<void> {
        await this.webDriverAdapter.progessWaiting();

        const proxy = await this.getProxyAndCheckAccessibility(element, location);
        const tagName = await element.getTagName();

        try {
            await proxy.click(element);
            await this.webDriverAdapter.driver.requestFocus(element);
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            throw new Error(`set value is not supported for '${location}', tagName: '${tagName}'\n${error.message}`);
        }

        await this.webDriverAdapter.progessWaiting();
        await this.webDriverAdapter.errorChecking();
    }
}
