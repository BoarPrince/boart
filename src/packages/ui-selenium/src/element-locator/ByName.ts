import { By } from 'selenium-webdriver/lib/by';
import { WebElement } from 'selenium-webdriver';
import { BaseParentLocator } from './BaseParentLocator';
import { SeleniumElementLocatorAdapter } from '../element-adapter/SeleniumElementLocatorAdapter';
import { SeleniumElementAdapter } from '../element-adapter/SeleniumElementAdapter';

/**
 *
 */
export class ByName extends BaseParentLocator {
    public readonly priority: 10;
    public readonly strategyCanBeNull = false;
    public readonly strategy = 'name';

    /**
     *
     */
    public getId(parentElement: SeleniumElementAdapter): Promise<string> {
        return parentElement.nativeElement.getAttribute('name');
    }

    /**
     *
     */
    public findChild(locationByStrategy: string, parentElement: SeleniumElementLocatorAdapter): Promise<WebElement[]> {
        // only check by name
        return parentElement.nativeElement.findElements(By.name(locationByStrategy));
    }

    /**
     *
     */
    public findAll(parentElement: SeleniumElementLocatorAdapter): Promise<WebElement[]> {
        return parentElement.nativeElement.findElements(By.xpath(`.//*[@name]`));
    }
}
