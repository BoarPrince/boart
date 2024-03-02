import { WebDriverProxy } from '../webdriver-adapter/WebDriverProxy';

/**
 *
 */
export interface UIProgressIndicator {
    /**
     *
     */
    readonly name: string;

    /**
     *
     */
    isProcessing(driver: WebDriverProxy): Promise<boolean>;
}
