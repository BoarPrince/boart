import { WebDriverProxy } from '../webdriver-adapter/WebDriverProxy';

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
