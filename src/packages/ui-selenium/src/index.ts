import { SeleniumDriverAdapter } from './web-driver/SeleniumDriverAdapter';
import { ElementAdapterLocatorHandler, UIElementProxyHandler, WebPageAdapterHandler } from '@boart/ui';
import { SeleniumWebPageAdapter } from './web-page-adaper/SeleniumWebPageAdapter';
import { ChromiumStandaloneDriver } from './web-driver/ChromiumStandaloneDriver';
import { ById } from './element-locator/ById';
import { ButtonProxy } from './ui-proxy/ButtonProxy';
import { ByText } from './element-locator/ByText';
import { DivProxy } from './ui-proxy/DivProxy';

/**
 *
 */
export default function initialize(): void {
    if (globalThis._uiSeleniumInitialized) {
        // call initialize only once a time
        return;
    } else {
        globalThis._uiSeleniumInitialized = true;
    }

    WebPageAdapterHandler.instance.addPageAdapterCreator('selenium.chromium.standalone', async () => {
        const driver = await new ChromiumStandaloneDriver().create();
        return new SeleniumWebPageAdapter(new SeleniumDriverAdapter(driver));
    });

    ElementAdapterLocatorHandler.instance.addLocator(new ById());
    ElementAdapterLocatorHandler.instance.addLocator(new ByText());

    UIElementProxyHandler.instance.addProxy('button', new ButtonProxy());
    UIElementProxyHandler.instance.addProxy('div', new DivProxy());
}

// eslint-disable-next-line jest/require-hook
(() => initialize())();
