import { WebDriverAdapter } from '../web-driver/WebDriverAdapter';

/**
 *
 */
export interface UIErrorIndicator {
    /**
     *
     */
    readonly name: string;

    /**
     *
     */
    getError(driver: WebDriverAdapter<unknown>): Promise<string | null>;
}
