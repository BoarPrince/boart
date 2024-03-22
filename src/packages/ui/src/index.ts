import { ElementAdapter } from './element-adapter/ElementAdapter';
import { ElementAdapterLocator } from './element-adapter/ElementAdapterLocator';
import { ElementAdapterLocatorHandler } from './element-adapter/ElementAdapterLocatorHandler';
import { UIElementProxyHandler } from './ui-element-proxy/UIElementProxyHandler';
import { UIErrorIndicator } from './ui-error-indicator/UIErrorIndicator';
import { UIErrorIndicatorHandler } from './ui-error-indicator/UIProgressIndicatorHandler';
import { UIProgressIndicator } from './ui-progress-indicator/UIProgressIndicator';
import { UIProgressIndicatorHandler } from './ui-progress-indicator/UIProgressIndicatorHandler';
import { WebPageAdapter } from './web-page-adapter/WebPageAdapter';
import { WebPageAdapterElement } from './web-page-adapter/WebPageAdapterElement';
import { ElementPosition } from './ui-element-proxy/ElementPosition';
import { WebDriverAdapter } from './web-driver/WebDriverAdapter';
import { WebPageAdapterElementLocator } from './web-page-adapter/WebPageAdapterElementLocator';
import { UIElementProxy } from './ui-element-proxy/UIElementProxy';
import { WebPageAdapterElementDefault } from './web-page-adapter/WebPageAdaperElementDefault';
import { WebPageAdapterDefault } from './web-page-adapter/WebPageAdapterDefault';
import { WebPageAdapterHandler } from './web-page-adapter/WebPageAdapterHandler';
import { UIElementProxyInfo } from './ui-element-proxy/UIElementProxyInfo';
import { WebPageAdapterScreenshot } from './web-page-adapter/WebPageAdapterScreenshot';
import { UIElementProxyActions } from './ui-element-proxy/UIElementProxyActions';
import { UIElementTableProxy } from './ui-element-proxy/UIElementTableProxy';
import { DescriptionCollectorHandler } from '@boart/core';

export {
    ElementAdapter,
    ElementAdapterLocator,
    ElementAdapterLocatorHandler,
    UIElementProxyActions,
    UIElementProxy,
    UIElementProxyInfo,
    UIElementProxyHandler,
    UIElementTableProxy,
    ElementPosition,
    UIErrorIndicator,
    UIErrorIndicatorHandler,
    UIProgressIndicator,
    UIProgressIndicatorHandler,
    WebDriverAdapter,
    WebPageAdapter,
    WebPageAdapterHandler,
    WebPageAdapterDefault,
    WebPageAdapterElement,
    WebPageAdapterElementDefault,
    WebPageAdapterElementLocator,
    WebPageAdapterScreenshot
};

/**
 *
 */
export default function initialize(): void {
    if (globalThis._uiInitialized) {
        return;
    } else {
        globalThis._uiInitialized = true;
    }

    DescriptionCollectorHandler.instance.addProvider(UIElementProxyHandler.instance);
}

// eslint-disable-next-line jest/require-hook
(() => initialize())();
