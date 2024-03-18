import { ElementAdapter } from '../element-adapter/ElementAdapter';
import { WebPageAdapterElement } from './WebPageAdapterElement';
import { WebDriverAdapter } from '../web-driver/WebDriverAdapter';
import { WebPageAdapterScreenshot } from './WebPageAdapterScreenshot';

/**
 *
 */

export interface WebPageAdapter<T> {
    /**
     *
     */
    readonly driver: WebDriverAdapter<T>;

    /**
     *
     */
    progessWaiting(): Promise<void>;

    /**
     *
     */
    errorChecking(): Promise<void>;

    /**
     *
     */
    getPageText(): Promise<string>;

    /**
     *
     */
    element: WebPageAdapterElement<T>;

    /**
     *
     */
    elements: {
        byClassName(location: string, element: ElementAdapter, index?: number): Promise<ElementAdapter[]>;
        byXPath(location: string, element: ElementAdapter, index?: number): Promise<ElementAdapter[]>;
        all(): Promise<ElementAdapter[]>;
        toString(element: ElementAdapter[]): string;
    };

    screenshot: WebPageAdapterScreenshot<T>;
}
