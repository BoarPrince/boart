/* eslint-disable no-var */
import { ElementProxyLocatorHandler } from './element-proxy/ElementProxyLocatorHandler';
import { UIElementProxyHandler } from './ui-element-proxy/UIElementProxyHandler';
import { UIErrorIndicatorHandler } from './ui-error-indicator/UIProgressIndicatorHandler';
import { UIProgressIndicatorHandler } from './ui-progress-indicator/UIProgressIndicatorHandler';

declare global {
    var _elementProxyLocatorHandler: ElementProxyLocatorHandler;
    var _uiElementProxyHandler: UIElementProxyHandler;
    var _uiProgressIndicatorHandlerInstance: UIProgressIndicatorHandler;
    var _uiErrorIndicatorHandlerInstance: UIErrorIndicatorHandler;
}
