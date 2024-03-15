import selenium from 'selenium-webdriver';

/**
 *
 */

export type LocatorAdapterType = {
    findElements(locator: selenium.By): Promise<selenium.WebElement[]>;
};
