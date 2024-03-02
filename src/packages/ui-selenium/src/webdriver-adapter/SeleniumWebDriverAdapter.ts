import { UIErrorIndicatorHandler, UIProgressIndicatorHandler, WebDriverAdapter } from '@boart/ui';
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
    public async progessWaiting(): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, 100));

        const checkProcessing = async () => {
            const indicators = UIProgressIndicatorHandler.instance.getAll();
            for (const indicator of indicators) {
                if (await indicator.isProcessing(this.driver)) {
                    return true;
                }
            }
            return false;
        };

        for (let index = 0; index < 1000; index++) {
            const isProcessing = await checkProcessing();

            if (isProcessing) {
                await new Promise((resolve) => setTimeout(resolve, 500));
            } else {
                return;
            }
        }
    }

    /**
     *
     */
    public async errorChecking(): Promise<void> {
        const indicators = UIErrorIndicatorHandler.instance.getAll();
        const errors = new Array<string>();
        for (const indicator of indicators) {
            const error = await indicator.getError(this.driver);
            if (error) {
                errors.push(`error detected by '${indicator.name}': ${error}`);
            }
        }

        if (errors.length > 0) {
            throw new Error(`ui errors detected:\n${errors.join('\n')}`);
        }
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
