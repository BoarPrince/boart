import { By } from 'selenium-webdriver/lib/by';
import { WebElement } from 'selenium-webdriver';
import { BaseLocator } from './BaseLocator';
import { SeleniumElementLocatorProxy } from '../element-proxy/SeleniumElementLocatorProxy';

/**
 *
 */
export class ByTitle extends BaseLocator {
    public readonly strategyCanBeNull = false;
    public readonly strategy = 'title';

    /**
     *
     */
    public async find(locationByStrategy: string, parentElement: SeleniumElementLocatorProxy): Promise<WebElement[]> {
        return await parentElement.nativeElement.findElements(By.xpath(`//*[@title='${locationByStrategy}']`));
    }

    /**
     *
     */
    findAll(parentElement: SeleniumElementLocatorProxy): Promise<WebElement[]> {
        return parentElement.nativeElement.findElements(By.xpath(`//*[@title]`));
    }
}
