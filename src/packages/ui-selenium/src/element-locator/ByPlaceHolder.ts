import { By } from 'selenium-webdriver/lib/by';
import { WebElement } from 'selenium-webdriver';
import { BaseLocator } from './BaseLocator';
import { SeleniumElementLocatorAdapter } from '../element-adapter/SeleniumElementLocatorAdapter';

/**
 *
 */
export class ByPlaceHolder extends BaseLocator {
    public readonly strategyCanBeNull = false;
    public readonly strategy = 'placeholder';

    /**
     *
     */
    public find(locationByStrategy: string, parentElement: SeleniumElementLocatorAdapter): Promise<WebElement[]> {
        return parentElement.nativeElement.findElements(By.xpath(`//*[@placeholder='${locationByStrategy}']`));
    }

    /**
     *
     */
    findAll(parentElement: SeleniumElementLocatorAdapter): Promise<WebElement[]> {
        return parentElement.nativeElement.findElements(By.xpath(`//*[@placeholder]`));
    }
}
