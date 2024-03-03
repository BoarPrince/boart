import { By } from 'selenium-webdriver/lib/by';
import { WebElement } from 'selenium-webdriver';
import { BaseLocator } from './BaseLocator';
import { SeleniumElementLocatorProxy } from '../element-proxy/SeleniumElementLocatorProxy';

/**
 *
 */
export class ById extends BaseLocator {
    public readonly strategyCanBeNull = false;
    public readonly strategy = 'id';

    /**
     *
     */
    public async find(locationByStrategy: string, parentElement: SeleniumElementLocatorProxy): Promise<WebElement[]> {
        return await parentElement.nativeElement.findElements(
            By.xpath(`.//*[@data-test-id='${locationByStrategy}' or @id='${locationByStrategy}']`)
        );
    }

    /**
     *
     */
    public async findAll(parentElement: SeleniumElementLocatorProxy): Promise<WebElement[]> {
        return await parentElement.nativeElement.findElements(By.xpath(`.//*[@data-test-id or @id]`));
    }
}