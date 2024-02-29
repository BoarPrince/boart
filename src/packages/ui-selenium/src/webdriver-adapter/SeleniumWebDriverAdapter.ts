import { WebDriverAdapter } from '@boart/ui';
import { SeleniumWebDriver } from './SeleniumWebDriver';
import { By } from 'selenium-webdriver';
import { SeleniumWebDriverAdapterElement } from './SeleniumWebDriverAdapterElement';

/**
 *
 */
export class SeleniumWebDriverAdapter implements WebDriverAdapter {
    /**
     *
     */
    public static instance(): WebDriverAdapter {
        return new SeleniumWebDriverAdapter();
    }

    /**
     *
     */
    public get driver(): SeleniumWebDriver {
        return null;
    }

    /**
     *
     */
    public isInProgess(): Promise<void> {
        return Promise.resolve();
    }

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
    public preventPrintDialog(): Promise<void> {
        return this.driver.nativeDriver.executeScript('window.print = () => {}');
    }

    /**
     *
     */
    readonly element = new SeleniumWebDriverAdapterElement(this.driver, this);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly elements: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly screenshot: any;
}
