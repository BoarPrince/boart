import { WebDriverProxy } from '@boart/ui';
import { WebDriver } from 'selenium-webdriver';

/**
 *
 */
export class SeleniumWebDriver implements WebDriverProxy {
    nativeDriver: WebDriver;
}
