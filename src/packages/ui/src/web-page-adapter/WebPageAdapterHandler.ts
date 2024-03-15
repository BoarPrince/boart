import { WebPageAdapter } from './WebPageAdapter';

/**
 *
 */
export class WebPageAdapterHandler {
    /**
     *
     */
    private pageAdapterList = new Map<string, () => Promise<WebPageAdapter<unknown>>>();

    /**
     *
     */
    private constructor() {
        // private, because singleton
    }

    /**
     *
     */
    public static get instance(): WebPageAdapterHandler {
        if (!globalThis._webPageAdapterHandlerInstance) {
            globalThis._webPageAdapterHandlerInstance = new WebPageAdapterHandler();
        }
        return globalThis._webPageAdapterHandlerInstance;
    }

    /**
     *
     */
    public getPageAdapterCreator<T>(name: string): () => Promise<WebPageAdapter<T>> {
        if (!this.pageAdapterList.has(name)) {
            throw new Error(`ui page adapter not found: '${name}'`);
        }

        return this.pageAdapterList.get(name) as () => Promise<WebPageAdapter<T>>;
    }

    /**
     *
     */
    public addPageAdapterCreator(name: string, adapter: () => Promise<WebPageAdapter<unknown>>): void {
        if (this.pageAdapterList.has(name)) {
            throw new Error(`ui page adapter already exists: '${name}'`);
        }

        this.pageAdapterList.set(name, adapter);
    }

    /**
     *
     */
    public clear(): void {
        this.pageAdapterList.clear();
    }
}
