import { ElementAdapter, WebDriverAdapter } from '@boart/ui';
import { WebDriver } from 'selenium-webdriver';

/**
 *
 */
export class SeleniumDriverAdapter implements WebDriverAdapter<WebDriver> {
    /**
     *
     */
    constructor(public readonly nativeDriver: WebDriver) {}

    /**
     *
     */
    public async clear(): Promise<void> {
        await this.nativeDriver.close();
        return this.nativeDriver.quit();
    }

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
    public html(snippet: string): Promise<void> {
        const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
        ${snippet}
        </body>
        </html>`;

        return this.open(`data:text/html;charset=utf-8,${html}`);
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
    public async requestFocus(element: ElementAdapter): Promise<void> {
        return this.nativeDriver.executeScript('arguments[0].focus(); arguments[0].scrollIntoView();', element.nativeElement);
    }

    /**
     *
     */
    public preventPrintDialog(): Promise<void> {
        return this.nativeDriver.executeScript('window.print = () => {}');
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
