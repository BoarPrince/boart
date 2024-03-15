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
    public readonly strategy = 'input-label';

    /**
     *
     */
    public getId(parentElement: SeleniumElementAdapter): Promise<string> {
        return parentElement.nativeElement.getText();
    }

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
    public findAll(parentElement: SeleniumElementLocatorAdapter): Promise<WebElement[]> {
        return parentElement.nativeElement.findElements(By.xpath(`//input[.//*[text()]]`));
    }
}
