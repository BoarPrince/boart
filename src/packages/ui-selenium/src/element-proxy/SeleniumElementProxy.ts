import { ElementProxy } from '@boart/ui';
import selenium, { By } from 'selenium-webdriver';
import { SeleniumElementLocatorProxy } from './SeleniumElementLocatorProxy';

/**
 *
 */
export class SeleniumElementProxy extends SeleniumElementLocatorProxy {
    private driver: selenium.WebDriver;

    // public declare readonly nativeElement: selenium.WebElement;
    /**
     *
     */
    public get nativeElement(): selenium.WebElement {
        return this._nativeElement as selenium.WebElement;
    }

    /**
     *
     */
    constructor(nativeElement: selenium.WebElement) {
        super(nativeElement);
        this.driver = nativeElement.getDriver();
    }

    /**
     *
     */
    async getParent(): Promise<ElementProxy> {
        const elements = await this.nativeElement.findElements(By.xpath('./parent::node()'));
        return elements?.length > 0 ? new SeleniumElementProxy(elements[0]) : null;
    }

    /**
     *
     */
    async isDisplayed(): Promise<boolean> {
        return await this.nativeElement.isDisplayed();
    }

    /**
     *
     */
    async isEnabled(): Promise<boolean> {
        return await this.nativeElement.isEnabled();
    }

    /**
     *
     */
    async isAccessible(): Promise<boolean> {
        try {
            await this.driver.wait(async () => await this.isDisplayed(), 2000);
            await this.driver.wait(async () => await this.isEnabled(), 2000);
        } catch (error) {
            throw new Error('element is not visible or not enabled');
        }

        return true;
    }
}
