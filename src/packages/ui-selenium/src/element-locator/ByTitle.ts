import { By } from 'selenium-webdriver/lib/by';
import { WebElement } from 'selenium-webdriver';
import { BaseLocator } from './BaseLocator';
import { SeleniumElementLocatorAdapter } from '../element-adapter/SeleniumElementLocatorAdapter';
import { SeleniumElementAdapter } from '../element-adapter/SeleniumElementAdapter';

/**
 *
 */
export class ByTitle extends BaseLocator {
    public readonly strategyCanBeNull = false;
    public readonly strategy = 'title';

    /**
     *
     */
    public getId(parentElement: SeleniumElementAdapter): Promise<string> {
        return parentElement.nativeElement.getAttribute('title');
    }

    /**
     *
     */
    public async find(locationByStrategy: string, parentElement: SeleniumElementLocatorAdapter): Promise<WebElement[]> {
        return await parentElement.nativeElement.findElements(By.xpath(`//*[@title='${locationByStrategy}']`));
    }

    /**
     *
     */
    findAll(parentElement: SeleniumElementLocatorAdapter): Promise<WebElement[]> {
        return parentElement.nativeElement.findElements(By.xpath(`//*[@title]`));
    }
}
