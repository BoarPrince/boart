import { ElementProxy } from '../element-proxy/ElementProxy';

/**
 *
 */
export interface WebDriverProxy {
    readonly nativeDriver: unknown;

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
}
