import { ElementAdapter } from '../element-adapter/ElementAdapter';
import { ElementPosition } from '../ui-element-proxy/ElementPosition';
import { UIElementProxy } from '../ui-element-proxy/UIElementProxy';
import { UIElementProxyHandler } from '../ui-element-proxy/UIElementProxyHandler';
import { UIElementProxyInfo } from '../ui-element-proxy/UIElementProxyInfo';
import { WebDriverAdapter } from '../web-driver/WebDriverAdapter';
import { WebPageAdapter } from './WebPageAdapter';
import { WebPageAdapterElement } from './WebPageAdapterElement';
import { WebPageAdapterElementLocator } from './WebPageAdapterElementLocator';
import { UIElementTableProxy } from '../ui-element-proxy/UIElementTableProxy';
import { UIElementProxyActions } from '../ui-element-proxy/UIElementProxyActions';
import { table } from 'console';

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
    private getElementAction(proxy: UIElementProxy, position?: ElementPosition): UIElementProxyActions {
        if (position) {
            const tableProxy = proxy as UIElementTableProxy;
            if (tableProxy.actions && typeof tableProxy.actions === 'function') {
                return tableProxy.actions(position);
            } else {
                throw new Error(`position cannot be defined for proxy action: ${proxy.name}`);
            }
        } else {
            return proxy;
        }
    }

    /**
     *
     */
    private async checkAccessibility(actions: UIElementProxyActions, element: ElementAdapter): Promise<void> {
        if (!(await actions.isDisplayed(element)) || !(await actions.isEnabled(element))) {
            throw new Error(
                `element location: '${await element.getLocation()}', tagName: '${actions.proxy.tagName}' is not visible or not enabled`
            );
        }
    }

    /**
     *
     */
    private getTableProxy(proxy: UIElementProxy): UIElementTableProxy {
        const tableProxy: UIElementTableProxy = proxy as UIElementTableProxy;
        return typeof tableProxy.getColumns === 'function' && typeof tableProxy.getRows === 'function' //
            ? tableProxy
            : null;
    }

    /**
     *
     */
    public async getElementInfo(element: ElementAdapter, position?: ElementPosition): Promise<UIElementProxyInfo> {
        const proxy = await this.getProxy(element);
        const elementAction = this.getElementAction(proxy, position);

        const tableProxy = this.getTableProxy(proxy);
        const tableInfo =
            // do not get table if table proxy is not defined
            // do not get table infos if position is defined
            !tableProxy || position
                ? undefined
                : {
                      columns: await tableProxy.getColumns(element),
                      rows: await tableProxy.getRows(element),
                      visibleRows: await tableProxy.getRows(element),
                      visibleColumns: await tableProxy.getRows(element)
                  };

        return {
            ident: await element.getLocation(),
            tagName: await (await elementAction.getElement(element)).getTagName(),
            proxyName: proxy.name,
            value: await elementAction.getValue(element),
            text: await elementAction.getText(element),
            classes: await elementAction.getClasses(element),
            isDisplayed: await elementAction.isDisplayed(element),
            isEnabled: await elementAction.isEnabled(element),
            isEditable: await elementAction.isEditable(element),
            isSelected: await elementAction.isSelected(element),
            tableInfo
        };
    }

    /**
     *
     */
    async setValue(value: string, element: ElementAdapter, position?: ElementPosition): Promise<void> {
        await this.webDriverAdapter.progessWaiting();

        const proxy = await this.getProxy(element);
        const tagName = await element.getTagName();
        const elementAction = this.getElementAction(proxy, position);

        try {
            await this.checkAccessibility(elementAction, element);
            await elementAction.setValue(value, element);
            await this.webDriverAdapter.driver.requestFocus(element);
        } catch (error) {
            throw new Error(`set value is not supported for '${await element.getLocation()}', tagName: '${tagName}'\n${error}`);
        }

        await this.webDriverAdapter.progessWaiting();
        await this.webDriverAdapter.errorChecking();
    }

    /**
     *
     */
    async click(element: ElementAdapter, position?: ElementPosition): Promise<void> {
        await this.webDriverAdapter.progessWaiting();

        const proxy = await this.getProxy(element);
        const tagName = await element.getTagName();
        const elementAction = this.getElementAction(proxy, position);

        try {
            await this.checkAccessibility(elementAction, element);
            await elementAction.click(element);
            await this.webDriverAdapter.driver.requestFocus(element);
        } catch (error) {
            throw new Error(`set value is not supported for '${await element.getLocation()}', tagName: '${tagName}'\n${error}`);
        }

        await this.webDriverAdapter.progessWaiting();
        await this.webDriverAdapter.errorChecking();
    }
}
