import { WebDriverAdapter } from '../web-driver/WebDriverAdapter';

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
    isProcessing(driver: WebDriverAdapter<unknown>): Promise<boolean>;
}
