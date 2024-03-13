import { By } from 'selenium-webdriver/lib/by';
import { WebElement } from 'selenium-webdriver';
import { BaseLocator } from './BaseLocator';
import { SeleniumElementLocatorAdapter } from '../element-adapter/SeleniumElementLocatorAdapter';

/**
 *
 */
export class ByTitle extends BaseLocator {
    public readonly strategyCanBeNull = false;
    public readonly strategy = 'input-label';

    /**
     *
     */
    public async find(locationByStrategy: string, parentElement: SeleniumElementLocatorAdapter): Promise<WebElement[]> {
        return await parentElement.nativeElement.findElements(By.xpath(`//input[.//*[contains(text(), "${locationByStrategy}")]]`));
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public findAll(_: SeleniumElementLocatorAdapter): Promise<WebElement[]> {
        return null;
    }
}
