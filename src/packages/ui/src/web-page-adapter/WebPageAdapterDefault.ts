import { UIErrorIndicatorHandler } from '../ui-error-indicator/UIProgressIndicatorHandler';
import { UIProgressIndicatorHandler } from '../ui-progress-indicator/UIProgressIndicatorHandler';
import { WebDriverAdapter } from '../web-driver/WebDriverAdapter';
import { WebPageAdapter } from './WebPageAdapter';
import { WebPageAdapterElement } from './WebPageAdapterElement';

/**
 *
 */
export abstract class WebPageAdapterDefault<T> implements WebPageAdapter<T> {
    /**
     *
     */
    constructor(public readonly driver: WebDriverAdapter<T>) {}

    /**
     *
     */
    public async progessWaiting(): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, 100));

        const checkProcessing = async () => {
            const indicators = UIProgressIndicatorHandler.instance.getAll();
            for (const indicator of indicators) {
                if (await indicator.isProcessing(this.driver)) {
                    return true;
                }
            }
            return false;
        };

        for (let index = 0; index < 1000; index++) {
            const isProcessing = await checkProcessing();

            if (isProcessing) {
                await new Promise((resolve) => setTimeout(resolve, 500));
            } else {
                return;
            }
        }
    }

    /**
     *
     */
    public async errorChecking(): Promise<void> {
        const indicators = UIErrorIndicatorHandler.instance.getAll();
        const errors = new Array<string>();
        for (const indicator of indicators) {
            const error = await indicator.getError(this.driver);
            if (error) {
                errors.push(`error detected by '${indicator.name}': ${error}`);
            }
        }

        if (errors.length > 0) {
            throw new Error(`ui errors detected:\n${errors.join('\n')}`);
        }
    }

    /**
     *
     */
    public abstract getPageText(): Promise<string>;

    /**
     *
     */
    public abstract readonly element: WebPageAdapterElement<T>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public abstract readonly elements: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public abstract readonly screenshot: any;
}
