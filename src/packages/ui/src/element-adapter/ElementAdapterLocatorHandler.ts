import { ElementAdapterLocator } from './ElementAdapterLocator';

/**
 *
 */
export class ElementAdapterLocatorHandler {
    private locators = new Map<string, Array<ElementAdapterLocator>>();

    /**
     *
     */
    private constructor() {}

    /**
     *
     */
    public static get instance(): ElementAdapterLocatorHandler {
        if (!globalThis._elementProxyLocatorHandler) {
            const instance = new ElementAdapterLocatorHandler();
            globalThis._elementProxyLocatorHandler = instance;
        }

        return globalThis._elementProxyLocatorHandler;
    }

    /**
     *
     */
    public addLocator(locator: ElementAdapterLocator) {
        if (!this.locators.has(locator.strategy)) {
            this.locators.set(locator.strategy, new Array<ElementAdapterLocator>());
        }

        this.locators.get(locator.strategy).push(locator);
    }

    /**
     *
     */
    public getLocators(strategy: string): Array<ElementAdapterLocator> | null {
        if (!this.locators.has(strategy)) {
            throw new Error(`locator for strategy ${strategy} does not exist`);
        }

        return this.locators.get(strategy);
    }

    /**
     *
     */
    public getAll(): ElementAdapterLocator[] {
        return Array.from(this.locators.values()).flat();
    }
}
