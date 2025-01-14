import { ElementAdapter } from '../element-adapter/ElementAdapter';

/**
 *
 */
export interface WebDriverAdapter<T> {
    readonly nativeDriver: T;

    /**
     *
     */
    clear(): Promise<void>;

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
    html(snippet: string): Promise<void>;

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
    preventPrintDialog(): Promise<void>;

    /**
     *
     */
    scrollToTop(): Promise<void>;

    /**
     *
     */
    requestFocus(element: ElementAdapter): Promise<void>;

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
}
