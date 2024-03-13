import { By } from 'selenium-webdriver/lib/by';
import { WebElement } from 'selenium-webdriver';
import { BaseLocator } from './BaseLocator';
import { SeleniumElementLocatorAdapter } from '../element-adapter/SeleniumElementLocatorAdapter';

/**
 *
 */
export class ByXPath extends BaseLocator {
    public readonly strategyCanBeNull = false;
    public readonly strategy = 'xpath';

    /**
     *
     */
    public async find(locationByStrategy: string, parentElement: SeleniumElementLocatorAdapter): Promise<WebElement[]> {
        return await parentElement.nativeElement.findElements(By.xpath(locationByStrategy));
    }

    /**
     *
     */
    findAll(): Promise<WebElement[]> {
        return null;
    }
}
