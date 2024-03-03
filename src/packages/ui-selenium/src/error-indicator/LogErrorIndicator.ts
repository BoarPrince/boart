import { UIErrorIndicator } from '@boart/ui';
import { SeleniumWebDriver } from '../web-driver-adapter/SeleniumWebDriver';
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

        return (
            logEntries
                // errors are not allowed
                .filter((entry) => entry.level === logging.Level.SEVERE)
                .map((entry) => entry.message)
                .join('\n')
        );
    }
}
