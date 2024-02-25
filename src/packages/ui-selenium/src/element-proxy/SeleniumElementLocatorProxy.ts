import { ElementProxy } from '@boart/ui';
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
export class SeleniumElementLocatorProxy implements ElementProxy {
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
    getParent(): Promise<ElementProxy> {
        return null;
    }
}
