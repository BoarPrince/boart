import { DescriptionCollector } from './DescriptionCollector';
import { DescriptionCollectorProvider } from './DescriptionCollectorProvider';

/**
 *
 */
export class DescriptionCollectorHandler {
    /**
     *
     */
    private descriptionCollectorProviderList = new Array<DescriptionCollectorProvider>();

    /**
     *
     */
    private constructor() {
        // singleton
    }

    /**
     *
     */
    public static get instance(): DescriptionCollectorHandler {
        if (!globalThis._descriptionCollectorHandlerInstance) {
            globalThis._descriptionCollectorHandlerInstance = new DescriptionCollectorHandler();
        }
        return globalThis._descriptionCollectorHandlerInstance;
    }

    /**
     *
     */
    public addProvider(provider: DescriptionCollectorProvider) {
        this.descriptionCollectorProviderList.push(provider);
    }

    /**
     *
     */
    public getDescriptionCollectors(): Array<DescriptionCollector> {
        const descriptionCollectorPromises = this.descriptionCollectorProviderList //
            .map((provider) => provider.getDescriptionCollector());

        return descriptionCollectorPromises;
    }
}
