import { UIErrorIndicator } from '@boart/ui';
import { SeleniumWebDriver } from '../webdriver-adapter/SeleniumWebDriver';
import { logging } from 'selenium-webdriver';

/**
 *
 */
export class LogErrorIndicator implements UIErrorIndicator {
    /**
     *
     */
    public name = 'error-log';

    /**
     *
     */
    public async getError(driver: SeleniumWebDriver): Promise<string> {
        // check logEntries
        const logEntries = await driver.nativeDriver.manage().logs().get(logging.Type.BROWSER);

        return logEntries
            .filter((entry) => entry.level === logging.Level.SEVERE)
            .map((entry) => entry.message)
            .join('\n');
    }
}
