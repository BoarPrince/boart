import { ElementProxy } from '../element-proxy/ElementProxy';
import { WebPageAdapterElement } from './WebPageAdapterElement';
import { WebDriverProxy } from '../web-driver/WebDriverProxy';

/**
 *
 */

export interface WebPageAdapter {
    /**
     *
     */
    readonly driver: WebDriverProxy;

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
    preventPrintDialog(): Promise<void>;

    /**
     *
     */
    element: WebPageAdapterElement;

    /**
     *
     */
    elements: {
        byClassName(location: string, element: ElementProxy, index?: number): Promise<ElementProxy[]>;
        byXPath(location: string, element: ElementProxy, index?: number): Promise<ElementProxy[]>;
        all(): Promise<ElementProxy[]>;
        toString(element: ElementProxy[]): string;
    };

    screenshot: {
        enable(): Promise<void>;
        disable(): Promise<void>;
        getFileName(): string;
        take(): Promise<string>;
    };
}
