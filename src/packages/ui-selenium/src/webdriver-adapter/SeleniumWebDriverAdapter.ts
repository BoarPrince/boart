import { ElementProxy, WebDriverAdapter } from '@boart/ui';
import { SeleniumWebDriver } from './SeleniumWebDriver';
import { By } from 'selenium-webdriver';

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
    public close(): Promise<void> {
        return this.driver.nativeDriver.close();
    }

    /**
     *
     * @param duration duration in seconds
     */
    public sleep(duration: number): Promise<void> {
        return new Promise<void>((resolve) => {
            setTimeout(() => resolve(), duration * 1000);
        });
    }

    /**
     *
     */
    public open(url: string): Promise<void> {
        return this.driver.nativeDriver.get(url);
    }

    /**
     *
     */
    public async clearCache(url: string): Promise<void> {
        await this.driver.nativeDriver.get(url);
        await this.driver.nativeDriver.manage().deleteAllCookies();
        await this.driver.nativeDriver.executeScript(`
            window.localStorage.clear();
            window.sessionStorage.clear();`);
    }

    /**
     *
     */
    public clearLocalStorage(): Promise<void> {
        return this.driver.nativeDriver.executeScript('localStorage.clear()');
    }

    /**
     *
     */
    public refresh(): Promise<void> {
        return this.driver.nativeDriver.navigate().refresh();
    }

    /**
     *
     */
    public wait(): Promise<void> {
        return Promise.resolve();
    }

    /**
     *
     */
    public scrollToTop(): Promise<void> {
        return this.driver.nativeDriver.executeScript('window.scrollTo(0, 0);');
    }

    /**
     *
     */
    public async requestFocus(element: ElementProxy): Promise<void> {
        return this.driver.nativeDriver.executeScript('arguments[0].focus(); arguments[0].scrollIntoView();', element.nativeElement);
    }

    /**
     *
     */
    public async switchTabTo(index: number): Promise<void> {
        const tabs = await this.driver.nativeDriver.getAllWindowHandles();
        await this.driver.nativeDriver.switchTo().window(tabs[index]);
    }

    /**
     *
     */
    public async closeTab(index: number): Promise<void> {
        await this.switchTabTo(index);
        await this.driver.nativeDriver.close();
    }

    /**
     *
     */
    public getCurrentUrl(): Promise<string> {
        return this.driver.nativeDriver.getCurrentUrl();
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
    public getXPath(element: ElementProxy): Promise<string> {
        return this.driver.nativeDriver.executeScript(() => {
            let selector = '';
            let foundRoot;
            let currentElement = arguments[0];

            do {
                const tagName = currentElement.tagName.toLowerCase();
                const parentElement = currentElement.parentElement;

                if (parentElement.childElementCount > 1) {
                    const parentsChildren = [...parentElement.children];
                    let tag = [];
                    parentsChildren.forEach((child) => {
                        if (child.tagName.toLowerCase() === tagName) tag.push(child);
                    });

                    if (tag.length === 1) {
                        selector = `/${tagName}${selector}`;
                    } else {
                        const position = tag.indexOf(currentElement) + 1;
                        selector = `/${tagName}[${position}]${selector}`;
                    }
                } else {
                    selector = `/${tagName}${selector}`;
                }

                currentElement = parentElement;
                foundRoot = parentElement.tagName.toLowerCase() === 'html';
                if (foundRoot) selector = `/html${selector}`;
            } while (foundRoot === false);

            return selector;
        }, element.nativeElement);
    }

    readonly element: any;
    readonly elements: any;
    readonly screenshot: any;
}
