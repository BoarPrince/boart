import { ElementAdapter } from '@boart/ui';
import selenium, { By } from 'selenium-webdriver';
import { SeleniumElementLocatorAdapter } from './SeleniumElementLocatorAdapter';
import { LocatorAdapterType } from './LocatorAdapterType';

/**
 *
 */

export class SeleniumElementAdapter extends SeleniumElementLocatorAdapter {
    private driver: selenium.WebDriver;

    /**
     *
     */
    public get nativeElement(): selenium.WebElement {
        return super.nativeElement as selenium.WebElement;
    }

    /**
     *
     */
    constructor(
        nativeElement: selenium.WebElement,
        private location: string
    ) {
        super(nativeElement);
        this.driver = nativeElement.getDriver();
    }

    /**
     *
     */
    async getLocation(): Promise<string> {
        return !this.location
            ? 'id:' + (await this.nativeElement.getAttribute('id')) //
            : Promise.resolve(this.location);
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
        // const elements = await this.nativeElement.findElements(By.xpath('./parent::node()'));
        const elements = await this.nativeElement.findElements(By.xpath('./ancestor::*'));
        return elements?.length > 0 ? new SeleniumElementAdapter(elements[0], null) : null;
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

    /**
     *
     */
    public static async getElement(xpath: string | Array<string>, element: ElementAdapter): Promise<ElementAdapter> {
        if (Array.isArray(xpath)) {
            for (const xPath of xpath) {
                const foundElement = await SeleniumElementAdapter.getElementBySingleXpath(xPath, element);
                if (foundElement) {
                    return foundElement;
                }
            }
            return null;
        } else {
            return await SeleniumElementAdapter.getElementBySingleXpath(xpath, element);
        }
    }

    /**
     *
     */
    private static async getElementBySingleXpath(xpath: string, element: ElementAdapter): Promise<ElementAdapter> {
        const nativeElement: LocatorAdapterType = element.nativeElement as LocatorAdapterType;

        const elements = (await nativeElement.findElements(By.xpath(xpath))) //
            .map((el) => new SeleniumElementAdapter(el, `xpath: ${xpath}`));

        if (elements.length === 0) {
            return null;
        }

        const nonDisplayedElements = new Array<ElementAdapter>();
        const displayedElements = new Array<ElementAdapter>();

        for (const e of elements) {
            if (await e.nativeElement.isDisplayed()) {
                displayedElements.push(e);
            } else {
                nonDisplayedElements.push(e);
            }
        }

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
}
