import { UIErrorIndicator } from '@boart/ui';
import { SeleniumDriverAdapter } from '../web-driver/SeleniumDriverAdapter';
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
    public async getError(driver: SeleniumDriverAdapter): Promise<string> {
        // check logEntries
        const logEntries = await driver.nativeDriver
            .manage() //
            .logs()
            .get(logging.Type.BROWSER);

        return (
            logEntries
                // errors are not allowed
                .filter((entry) => entry.level === logging.Level.SEVERE)
                .map((entry) => entry.message)
                .join('\n')
        );
    }
}
