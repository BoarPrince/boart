import { WebDriverProxy } from '../web-driver/WebDriverProxy';

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
