import { WebPageAdapter } from './WebPageAdapter';

/**
 *
 */
export interface WebPageAdapterScreenshot<T> {
    readonly webDriverAdapter: WebPageAdapter<T>;

    /**
     *
     */
    enable(): Promise<void>;

    /**
     *
     */
    disable(): Promise<void>;

    /**
     *
     */
    getFileName(): string;

    /**
     *
     */
    take(filename?: string): Promise<string>;
}
