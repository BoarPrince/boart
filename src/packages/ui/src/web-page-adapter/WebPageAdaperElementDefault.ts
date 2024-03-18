import { ElementAdapter } from '../element-adapter/ElementAdapter';
import { UIElementProxy } from '../ui-element-proxy/UIElementProxy';
import { UIElementProxyHandler } from '../ui-element-proxy/UIElementProxyHandler';
import { UIElementProxyInfo } from '../ui-element-proxy/UIElementProxyInfo';
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
    public async getProxy(element: ElementAdapter): Promise<UIElementProxy> {
        const proxy = await UIElementProxyHandler.instance.getProxy(element);
        const tagName = await element.getTagName();

        if (!proxy) {
            throw new Error(`elements are nots supported with tagName: '${tagName}'`);
        }

        return proxy;
    }

    /**
     *
     */
    public async getElementInfo(element: ElementAdapter): Promise<UIElementProxyInfo> {
        const proxy = await this.getProxy(element);
        return {
            ident: await element.getId(),
            tagName: await element.getTagName(),
            proxyName: proxy.name,
            value: await proxy.getValue(element),
            classes: await proxy.getClasses(element),
            isDisplayed: await proxy.isDisplayed(element),
            isEnabled: await proxy.isEnabled(element),
            isEditable: await proxy.isEditable(element),
            isSelected: await proxy.isSelected(element)
        };
    }

    /**
     *
     */
    private async checkAccessibility(proxy: UIElementProxy, element: ElementAdapter, location: string): Promise<void> {
        if (!(await proxy.isDisplayed(element)) || !(await proxy.isEnabled(element))) {
            throw new Error(`element location: '${location ?? '-'}', tagName: '${proxy.tagName}' is not visible or not enabled`);
        }
    }

    /**
     *
     */
    async setValue(value: string, location: string, element: ElementAdapter): Promise<void> {
        await this.webDriverAdapter.progessWaiting();

        const proxy = await this.getProxy(element);
        const tagName = await element.getTagName();

        try {
            await this.checkAccessibility(proxy, element, location);
            await proxy.setValue(value, element);
            await this.webDriverAdapter.driver.requestFocus(element);
        } catch (error) {
            throw new Error(`set value is not supported for '${location}', tagName: '${tagName}'\n${error}`);
        }

        await this.webDriverAdapter.progessWaiting();
        await this.webDriverAdapter.errorChecking();
    }

    /**
     *
     */
    async click(location: string, element: ElementAdapter): Promise<void> {
        await this.webDriverAdapter.progessWaiting();

        const proxy = await this.getProxy(element);
        const tagName = await element.getTagName();

        try {
            await this.checkAccessibility(proxy, element, location);
            await proxy.click(element);
            await this.webDriverAdapter.driver.requestFocus(element);
        } catch (error) {
            throw new Error(`set value is not supported for '${location}', tagName: '${tagName}'\n${error}`);
        }

        await this.webDriverAdapter.progessWaiting();
        await this.webDriverAdapter.errorChecking();
    }
}
