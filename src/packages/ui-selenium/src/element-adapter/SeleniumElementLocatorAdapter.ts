import { ElementAdapter } from '@boart/ui';
import selenium, { By } from 'selenium-webdriver';
import { SeleniumElementAdapter } from './SeleniumElementAdapter';

/**
 *
 */
type LocatorType = {
    findElements(locator: selenium.By): Promise<selenium.WebElement[]>;
};

/**
 *
 */
export class SeleniumElementLocatorAdapter implements ElementAdapter {
    /**
     *
     */
    protected readonly _nativeElement: LocatorType;

    /**
     *
     */
    public get nativeElement(): LocatorType {
        return this._nativeElement;
    }

    /**
     *
     */
    constructor(nativeElement: LocatorType) {
        this._nativeElement = nativeElement;
    }

    /**
     *
     */
    public isDisplayed(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    /**
     *
     */
    public isEnabled(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    /**
     *
     */
    public isAccessible(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    /**
     *
     */
    public getTagName(): Promise<string> {
        throw new Error('Method not implemented.');
    }

    /**
     *
     */
    public getParent(): Promise<ElementAdapter> {
        return null;
    }

    /**
     *
     */
    public getXPath(): Promise<string> {
        return Promise.resolve('/');
    }

    /**
     *
     */
    private async getElementBySingleXpath(xpath: string): Promise<ElementAdapter> {
        const elements = (await this.nativeElement.findElements(By.xpath(xpath))) //
            .map((el) => new SeleniumElementAdapter(el));

        if (elements.length === 0) {
            return null;
        }

        const nonDisplayedElements = elements.filter(async (e) => !(await e.isDisplayed()));
        const displayedElements = elements.filter(async (e) => await e.isDisplayed());

        if (nonDisplayedElements.length === 1 && (await nonDisplayedElements[0].isDisplayed())) {
            throw new Error(`element found for xpath '${xpath}' is not visible`);
        }

        if (displayedElements.length > 1) {
            const xpaths = [];
            for (const el of displayedElements) {
                xpaths.push(await el.getXPath());
            }

            throw new Error(`multiple elements found for xpath '${xpath}':
            ${xpaths.join('\n\t- ')}`);
        }

        return displayedElements[0];
    }

    /**
     *
     */
    public async getElement(xpath: string | Array<string>): Promise<ElementAdapter> {
        if (Array.isArray(xpath)) {
            for (const xPath of xpath) {
                const foundElement = await this.getElementBySingleXpath(xPath);
                if (foundElement) {
                    return foundElement;
                }
            }
            return null;
        } else {
            return await this.getElementBySingleXpath(xpath);
        }
    }
}
