import { ElementAdapter } from '@boart/ui';
import selenium from 'selenium-webdriver';

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
    getTagName(): Promise<string> {
        throw new Error('Method not implemented.');
    }

    /**
     *
     */
    getParent(): Promise<ElementAdapter> {
        return null;
    }

    /**
     *
     */
    getXPath(): Promise<string> {
        return Promise.resolve('/');
    }
}
