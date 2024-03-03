import { WebDriverProxy } from '../web-driver/WebDriverProxy';

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
    getError(driver: WebDriverProxy): Promise<string | null>;
}
