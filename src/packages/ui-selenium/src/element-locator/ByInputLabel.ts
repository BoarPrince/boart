import { By } from 'selenium-webdriver/lib/by';
import { WebElement } from 'selenium-webdriver';
import { BaseLocator } from './BaseLocator';
import { SeleniumElementLocatorProxy } from '../element-proxy/SeleniumElementLocatorProxy';

/**
 *
 */
export class ByTitle extends BaseLocator {
    public readonly strategyCanBeNull = false;
    public readonly strategy = 'input-label';

    /**
     *
     */
    public async find(locationByStrategy: string, parentElement: SeleniumElementLocatorProxy): Promise<WebElement[]> {
        return await parentElement.nativeElement.findElements(By.xpath(`//input[.//*[contains(text(), "${locationByStrategy}")]]`));
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public findAll(_: SeleniumElementLocatorProxy): Promise<WebElement[]> {
        return null;
    }
}
