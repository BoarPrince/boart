import { By } from 'selenium-webdriver/lib/by';
import { WebElement } from 'selenium-webdriver';
import { BaseLocator } from './BaseLocator';
import { SeleniumElementLocatorProxy } from '../element-proxy/SeleniumElementLocatorProxy';

/**
 *
 */
export class ByXPath extends BaseLocator {
    public readonly strategyCanBeNull = false;
    public readonly strategy = 'xpath';

    /**
     *
     */
    public async find(locationByStrategy: string, parentElement: SeleniumElementLocatorProxy): Promise<WebElement[]> {
        return await parentElement.nativeElement.findElements(By.xpath(locationByStrategy));
    }

    /**
     *
     */
    findAll(): Promise<WebElement[]> {
        return null;
    }
}
