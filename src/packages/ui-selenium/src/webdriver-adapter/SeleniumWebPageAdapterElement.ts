import { ElementProxy, UIElementProxyHandler, WebPageAdapter, WebPageAdapterElement } from '@boart/ui';
import { SeleniumWebDriver } from './SeleniumWebDriver';
import { SeleniumElementProxyLocator } from './SeleniumElementProxyLocator';
import { UIElementProxy } from '@boart/ui/lib/ui-element-proxy/UIElementProxy';

/**
 *
 */
export class SeleniumWebPageAdapterElement implements WebPageAdapterElement {
    /**
     *
     */
    constructor(
        private driver: SeleniumWebDriver,
        public readonly webDriverAdapter: WebPageAdapter
    ) {
        this.locator = new SeleniumElementProxyLocator(this.driver);
    }

    /**
     *
     */
    public async byId(location: string, parentElement?: ElementProxy, index?: number): Promise<ElementProxy> {
        return this.locator.findBy('id', location, parentElement, index);
    }

    /**
     *
     */
    readonly locator: SeleniumElementProxyLocator;

    /**
     *
     */
    private async getProxyAndCheckAccessibility(element: ElementProxy, location: string): Promise<UIElementProxy> {
        const proxy = await UIElementProxyHandler.instance.getProxy(element);
        const tagName = await element.getTagName();

        if (!proxy) {
            throw new Error(`elements are nots supported with tagName: '${tagName}'`);
        }

        if (!(await proxy.isDisplayed()) || !(await proxy.isEnabled())) {
            throw new Error(`element location: '${location}', tagName: '${tagName}' is not visible or not enabled`);
        }

        return proxy;
    }

    /**
     *
     */
    async setValue(value: string, location: string, element: ElementProxy): Promise<void> {
        await this.webDriverAdapter.progessWaiting();

        const proxy = await this.getProxyAndCheckAccessibility(element, location);
        const tagName = await element.getTagName();

        try {
            await proxy.requestFocus(element);
            await proxy.setValue(value, element);
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
    async click(location: string, element: ElementProxy): Promise<void> {
        await this.webDriverAdapter.progessWaiting();

        const proxy = await this.getProxyAndCheckAccessibility(element, location);
        const tagName = await element.getTagName();

        try {
            await proxy.requestFocus(element);
            await proxy.click(element);
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            throw new Error(`set value is not supported for '${location}', tagName: '${tagName}'\n${error.message}`);
        }

        await this.webDriverAdapter.progessWaiting();
        await this.webDriverAdapter.errorChecking();
    }
}
