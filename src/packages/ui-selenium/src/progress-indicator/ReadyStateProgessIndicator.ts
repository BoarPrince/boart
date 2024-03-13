import { UIProgressIndicator } from '@boart/ui';
import { SeleniumWebDriver } from '../web-page-adaper/SeleniumWebDriver';

/**
 *
 */
export class ReadyStateProgessIndicator implements UIProgressIndicator {
    /**
     *
     */
    public name = 'readyState';

    /**
     *
     */
    public isProcessing(driver: SeleniumWebDriver): Promise<boolean> {
        return driver.nativeDriver //
            .executeScript(() => document.readyState)
            .then((readyState) => readyState !== 'complete');
    }
}
