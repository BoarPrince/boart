import { ElementProxy, WebDriverProxy } from '@boart/ui';
import { WebDriver } from 'selenium-webdriver';

/**
 *
 */
export class SeleniumWebDriver implements WebDriverProxy {
    /**
     *
     */
    constructor(public readonly nativeDriver: WebDriver) {}

    /**
     *
     */
    public close(): Promise<void> {
        return this.nativeDriver.close();
    }

    /**
     *
     * @param duration duration in seconds
     */
    public async sleep(duration: number): Promise<void> {
        await this.nativeDriver.sleep(duration * 1000);
    }

    /**
     *
     */
    public open(url: string): Promise<void> {
        return this.nativeDriver.get(url);
    }

    /**
     *
     */
    public async clearCache(url: string): Promise<void> {
        await this.nativeDriver.get(url);
        await this.nativeDriver.manage().deleteAllCookies();
        await this.nativeDriver.executeScript(`
          window.localStorage.clear();
          window.sessionStorage.clear();`);
    }

    /**
     *
     */
    public clearLocalStorage(): Promise<void> {
        return this.nativeDriver.executeScript('localStorage.clear()');
    }

    /**
     *
     */
    public refresh(): Promise<void> {
        return this.nativeDriver.navigate().refresh();
    }

    /**
     *
     */
    public scrollToTop(): Promise<void> {
        return this.nativeDriver.executeScript('window.scrollTo(0, 0);');
    }

    /**
     *
     */
    public async requestFocus(element: ElementProxy): Promise<void> {
        return this.nativeDriver.executeScript('arguments[0].focus(); arguments[0].scrollIntoView();', element.nativeElement);
    }

    /**
     *
     */
    public async switchTabTo(index: number): Promise<void> {
        const tabs = await this.nativeDriver.getAllWindowHandles();
        await this.nativeDriver.switchTo().window(tabs[index]);
    }

    /**
     *
     */
    public async closeTab(index: number): Promise<void> {
        await this.switchTabTo(index);
        await this.nativeDriver.close();
    }

    /**
     *
     */
    public getCurrentUrl(): Promise<string> {
        return this.nativeDriver.getCurrentUrl();
    }
}
