import { By } from 'selenium-webdriver/lib/by';
import { WebElement } from 'selenium-webdriver';
import { BaseLocator } from './BaseLocator';
import { SeleniumElementLocatorProxy } from '../element-proxy/SeleniumElementLocatorProxy';

/**
 *
 */
export class ByXPath extends BaseLocator {
    public readonly strategyCanBeNull = true;
    public readonly strategy = 'submit';

    /**
     *
     */
    public find(_: string, parentElement: SeleniumElementLocatorProxy): Promise<WebElement[]> {
        return parentElement.nativeElement.findElements(By.xpath('(//button|//input)[@type="submit"]|(//form//button)[not(@type)]'));
    }

    /**
     *
     */
    findAll(parentElement: SeleniumElementLocatorProxy): Promise<WebElement[]> {
        return this.find(null, parentElement);
    }
}
