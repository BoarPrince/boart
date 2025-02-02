import { SeleniumDriverAdapter } from './web-driver/SeleniumDriverAdapter';
import { ElementAdapterLocatorHandler, UIElementProxyHandler, WebPageAdapterHandler } from '@boart/ui';
import { SeleniumWebPageAdapter } from './web-page-adaper/SeleniumWebPageAdapter';
import { ChromiumStandaloneDriver } from './web-driver/ChromiumStandaloneDriver';
import { ById } from './element-locator/ById';
import { ButtonProxy } from './ui-proxy/ButtonProxy';
import { ByText } from './element-locator/ByText';
import { DivProxy } from './ui-proxy/DivProxy';
import { SelectProxy } from './ui-proxy/SelectProxy';
import { RadioProxy } from './ui-proxy/RadioProxy';
import { RadioGroupProxy } from './ui-proxy/RadioGroupProxy';
import { TableProxy } from './ui-proxy/TableProxy';
import { InputButtonProxy } from './ui-proxy/InputButtonProxy';
import { InputProxy } from './ui-proxy/InputProxy';
import { InputSubmitButtonProxy } from './ui-proxy/InputSubmitButtonProxy';
import { BySubmit } from './element-locator/BySubmit';
import { AnyProxy } from './ui-proxy/AnyProxy';
import { CheckboxProxy } from './ui-proxy/CheckboxProxy';
import { ByDataTestId } from './element-locator/ByIDataTestId';
import { ByHref } from './element-locator/ByHref';
import { ByInputLabel } from './element-locator/ByInputLabel';
import { ByName } from './element-locator/ByName';
import { ByPlaceHolder } from './element-locator/ByPlaceHolder';
import { ByTitle } from './element-locator/ByTitle';
import { ByXPath } from './element-locator/ByXPath';
import { ByClass } from './element-locator/ByClass';

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
    ElementAdapterLocatorHandler.instance.addLocator(new ByDataTestId());
    ElementAdapterLocatorHandler.instance.addLocator(new ByText());
    ElementAdapterLocatorHandler.instance.addLocator(new BySubmit());
    ElementAdapterLocatorHandler.instance.addLocator(new ByHref());
    ElementAdapterLocatorHandler.instance.addLocator(new ByInputLabel());
    ElementAdapterLocatorHandler.instance.addLocator(new ByName());
    ElementAdapterLocatorHandler.instance.addLocator(new ByPlaceHolder());
    ElementAdapterLocatorHandler.instance.addLocator(new ByTitle());
    ElementAdapterLocatorHandler.instance.addLocator(new ByXPath());
    ElementAdapterLocatorHandler.instance.addLocator(new ByClass());

    UIElementProxyHandler.instance.addProxy('table', new TableProxy());
    UIElementProxyHandler.instance.addProxy('button', new ButtonProxy());
    UIElementProxyHandler.instance.addProxy('div', new DivProxy());
    UIElementProxyHandler.instance.addProxy('select', new SelectProxy());
    UIElementProxyHandler.instance.addProxy('input', new RadioProxy());
    UIElementProxyHandler.instance.addProxy('input', new CheckboxProxy());
    UIElementProxyHandler.instance.addProxy('input', new InputButtonProxy());
    UIElementProxyHandler.instance.addProxy('input', new InputSubmitButtonProxy());
    UIElementProxyHandler.instance.addProxy('input', new InputProxy());
    UIElementProxyHandler.instance.addProxy('*', new RadioGroupProxy());
    UIElementProxyHandler.instance.addProxy('*', new AnyProxy());
}

// eslint-disable-next-line jest/require-hook
(() => initialize())();
