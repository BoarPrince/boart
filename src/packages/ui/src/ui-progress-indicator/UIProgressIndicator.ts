import { WebDriverAdapter } from '../webdriver-adapter/WebDriverAdapter';

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
    isProcessing(webDriverAdapter: WebDriverAdapter): Promise<boolean>;
}
