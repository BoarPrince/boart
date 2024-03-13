import { ElementAdapter } from '@boart/ui';
import selenium, { By } from 'selenium-webdriver';
import { SeleniumElementLocatorAdapter } from './SeleniumElementLocatorAdapter';

/**
 *
 */
export class SeleniumElementAdapter extends SeleniumElementLocatorAdapter {
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
    getTagName(): Promise<string> {
        return this.nativeElement.getTagName();
    }

    /**
     *
     */
    async getParent(): Promise<ElementAdapter> {
        const elements = await this.nativeElement.findElements(By.xpath('./parent::node()'));
        return elements?.length > 0 ? new SeleniumElementAdapter(elements[0]) : null;
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

    /**
     *
     */
    public getXPath(): Promise<string> {
        return this.driver.executeScript(() => {
            // eslint-disable-next-line prefer-rest-params
            let currentElement = arguments[0] as Element;
            let xpath = '';
            let isRootElement = false;

            while (!isRootElement) {
                const tagName = currentElement.tagName.toLowerCase();
                const parentElement = currentElement.parentElement;

                if (parentElement.childElementCount > 1) {
                    const parentsChildren = Array.from(parentElement.children);
                    const elementsByTag = parentsChildren.filter((child) => child.tagName.toLowerCase() === tagName);

                    if (elementsByTag.length > 1) {
                        const position = elementsByTag.indexOf(currentElement);
                        xpath = `/${tagName}[${position}]${xpath}`;
                    } else {
                        xpath = `/${tagName}${xpath}`;
                    }
                } else {
                    xpath = `/${tagName}${xpath}`;
                }

                currentElement = parentElement;
                isRootElement = parentElement.tagName.toLowerCase() === 'html';
                if (isRootElement) {
                    xpath = `/html${xpath}`;
                }
            }

            return xpath;
        }, this.nativeElement);
    }
}
