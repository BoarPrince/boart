/* eslint-disable no-var */
import { ElementAdapterLocatorHandler } from './element-adapter/ElementAdapterLocatorHandler';
import { UIElementProxyHandler } from './ui-element-proxy/UIElementProxyHandler';
import { UIErrorIndicatorHandler } from './ui-error-indicator/UIProgressIndicatorHandler';
import { UIProgressIndicatorHandler } from './ui-progress-indicator/UIProgressIndicatorHandler';
import { WebPageAdapterHandler } from './web-page-adapter/WebPageAdapterHandler';

declare global {
    var _elementProxyLocatorHandler: ElementAdapterLocatorHandler;
    var _uiElementProxyHandler: UIElementProxyHandler;
    var _uiProgressIndicatorHandlerInstance: UIProgressIndicatorHandler;
    var _uiErrorIndicatorHandlerInstance: UIErrorIndicatorHandler;
    var _webPageAdapterHandlerInstance: WebPageAdapterHandler;
}
