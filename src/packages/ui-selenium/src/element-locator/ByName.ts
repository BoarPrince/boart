import { By } from 'selenium-webdriver/lib/by';
import { WebElement } from 'selenium-webdriver';
import { BaseParentLocator } from './BaseParentLocator';
import { SeleniumElementLocatorAdapter } from '../element-adapter/SeleniumElementLocatorAdapter';

/**
 *
 */
export class ByName extends BaseParentLocator {
    public readonly strategyCanBeNull = false;
    public readonly strategy = 'name';

    /**
     *
     */
    public findChild(locationByStrategy: string, parentElement: SeleniumElementLocatorAdapter): Promise<WebElement[]> {
        // only check by name
        const elements = parentElement.nativeElement.findElements(
            By.xpath(`.//*[@name='${locationByStrategy}' or @formcontrolname='${locationByStrategy}']`)
        );
        return elements;
    }

    /**
     *
     */
    public findAll(parentElement: SeleniumElementLocatorAdapter): Promise<WebElement[]> {
        return parentElement.nativeElement.findElements(By.xpath(`.//*[@name or @formcontrolname]`));
    }
}
