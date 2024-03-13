import { WebElement } from 'selenium-webdriver';
import { BaseLocator } from './BaseLocator';
import { UIElementProxyHandler } from '@boart/ui';
import { SeleniumElementLocatorAdapter } from '../element-adapter/SeleniumElementLocatorAdapter';

/**
 *
 */
export class ByText extends BaseLocator {
    public readonly strategyCanBeNull = false;
    public readonly strategy = 'text';

    /**
     *
     */
    public async find(locationByStrategy: string, parentElement: SeleniumElementLocatorAdapter): Promise<WebElement[]> {
        return (await UIElementProxyHandler.instance.getElementsByText(locationByStrategy, parentElement)).map(
            (proxyElement) => proxyElement.nativeElement as WebElement
        );
    }

    /**
     *
     */
    public async findAll(parentElement: SeleniumElementLocatorAdapter): Promise<WebElement[]> {
        return (await UIElementProxyHandler.instance.getElementsByText(null, parentElement)).map(
            (proxyElement) => proxyElement.nativeElement as WebElement
        );
    }
}
