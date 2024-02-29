import { WebElement } from 'selenium-webdriver';
import { BaseLocator } from './BaseLocator';
import { UIElementProxyHandler } from '@boart/ui';

/**
 *
 */
export class ByText extends BaseLocator {
    public readonly strategyCanBeNull = false;
    public readonly strategy = 'text';

    /**
     *
     */
    public async find(locationByStrategy: string): Promise<WebElement[]> {
        return (await UIElementProxyHandler.instance.getElementsByText(locationByStrategy)).map(
            (proxyElement) => proxyElement.nativeElement as WebElement
        );
    }

    /**
     *
     */
    public async findAll(): Promise<WebElement[]> {
        return (await UIElementProxyHandler.instance.getElementsByText()).map((proxyElement) => proxyElement.nativeElement as WebElement);
    }
}
