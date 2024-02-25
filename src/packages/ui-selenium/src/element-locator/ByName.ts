import { By } from 'selenium-webdriver/lib/by';
import { WebElement } from 'selenium-webdriver';
import { BaseParentLocator } from './BaseParentLocator';
import { SeleniumElementLocatorProxy } from '../element-proxy/SeleniumElementLocatorProxy';

/**
 *
 */
export class ByName extends BaseParentLocator {
    public readonly strategyCanBeNull = false;
    public readonly strategy = 'name';

    /**
     *
     */
    public findChild(locationByStrategy: string, parentElement: SeleniumElementLocatorProxy): Promise<WebElement[]> {
        // only check by name
        const elements = parentElement.nativeElement.findElements(
            By.xpath(`.//*[@name='${locationByStrategy}' or @formcontrolname='${locationByStrategy}']`)
        );
        return elements;
    }

    /**
     *
     */
    public findAll(parentElement: SeleniumElementLocatorProxy): Promise<WebElement[]> {
        return parentElement.nativeElement.findElements(By.xpath(`.//*[@name or @formcontrolname]`));
    }
}
