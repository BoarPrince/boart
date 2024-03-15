import { UIProgressIndicator } from '@boart/ui';
import { SeleniumDriverAdapter } from '../web-driver/SeleniumDriverAdapter';

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
    public isProcessing(driver: SeleniumDriverAdapter): Promise<boolean> {
        return driver.nativeDriver //
            .executeScript(() => document.readyState)
            .then((readyState) => readyState !== 'complete');
    }
}
