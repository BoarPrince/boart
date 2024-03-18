import { WebPageAdapterDefault, WebPageAdapterElementDefault } from '@boart/ui';
import { By, WebDriver } from 'selenium-webdriver';
import { SeleniumElementAdapterLocator } from './SeleniumElementAdapterLocator';
import { SeleniumWebPageAdapterScreenshot } from './SeleniumWebPageAdapterScreenshot';

/**
 *
 */
export class SeleniumWebPageAdapter extends WebPageAdapterDefault<WebDriver> {
    /**
     *
     */
    public async getPageText(): Promise<string> {
        // get body text
        const bodyElement = await this.driver.nativeDriver.findElement(By.css('body'));
        const pageTextArr = [];
        pageTextArr.push(await bodyElement.getText());

        // get text of any input fields
        const inputElements = await this.driver.nativeDriver.findElements(By.css('input'));
        for (const element of inputElements) {
            const value = await element.getAttribute('value');
            pageTextArr.push(value);
        }

        return pageTextArr.join('\n');
    }

    /**
     *
     */
    readonly element = new WebPageAdapterElementDefault(this.driver, this, new SeleniumElementAdapterLocator(this.driver));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly elements: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly screenshot = new SeleniumWebPageAdapterScreenshot(this);
}
