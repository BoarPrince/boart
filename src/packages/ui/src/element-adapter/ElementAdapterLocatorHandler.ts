import { ElementAdapterLocator } from './ElementAdapterLocator';

/**
 *
 */
export class ElementAdapterLocatorHandler {
    private locators = new Map<string, ElementAdapterLocator>();

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
        if (this.locators.has(locator.strategy)) {
            throw new Error(`locator for strategy ${locator.strategy} already exists`);
        }

        this.locators.set(locator.strategy, locator);
    }

    /**
     *
     */
    public findLocator(strategy: string): ElementAdapterLocator | null {
        if (!this.locators.has(strategy)) {
            throw new Error(`locator for strategy ${strategy} does not exist`);
        }

        return this.locators.get(strategy);
    }

    /**
     *
     */
    public getAll(): ElementAdapterLocator[] {
        return Array.from(this.locators.values());
    }
}
