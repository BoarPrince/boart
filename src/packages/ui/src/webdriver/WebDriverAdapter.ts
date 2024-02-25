import { ElementProxy } from '../element-proxy/ElementProxy';
import { WebDriverAdapterElement } from './WebDriverAdapterElement';
import { WebDriverProxy } from './WebDriverProxy';

/**
 *
 */

export interface WebDriverAdapter {
    // /**
    //  *
    //  */
    // readonly elementLocator: ElementProxyLocatorHandler;
    readonly driver: WebDriverProxy;
    /**
     *
     */
    close(): Promise<void>;

    /**
     *
     * @param duration duration in seconds
     */
    sleep(duration: number): Promise<void>;

    /**
     *
     */
    open(url: string): Promise<void>;

    /**
     *
     */
    clearCache(url: string): Promise<void>;

    /**
     *
     */
    clearLocalStorage(): Promise<void>;

    /**
     *
     */
    refresh(): Promise<void>;

    /**
     *
     */
    wait(): Promise<void>;

    /**
     *
     */
    scrollToTop(): Promise<void>;

    /**
     *
     */
    requestFocus(element: ElementProxy): Promise<void>;

    // /**
    //  *
    //  */
    // callCustomStep(stepName: string, value: string): Promise<void>;
    /**
     *
     */
    switchTabTo(index: number): Promise<void>;

    /**
     *
     */
    closeTab(index: number): Promise<void>;

    /**
     *
     */
    getCurrentUrl(): Promise<string>;

    /**
     *
     */
    getPageText(): Promise<string>;

    /**
     *
     */
    preventPrintDialog(): Promise<void>;

    /**
     * returns absolute xpath
     */
    getXPath(element: ElementProxy): Promise<string>;

    /**
     *
     */
    element: WebDriverAdapterElement;

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
