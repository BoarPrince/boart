import { ElementProxyLocator } from './ElementProxyLocator';

/**
 *
 */
export class ElementProxyLocatorHandler {
    private locators = new Map<string, ElementProxyLocator>();

    /**
     *
     */
    private constructor() {}

    /**
     *
     */
    public static get instance(): ElementProxyLocatorHandler {
        if (!globalThis._elementProxyLocatorHandler) {
            const instance = new ElementProxyLocatorHandler();
            globalThis._elementProxyLocatorHandler = instance;
        }

        return globalThis._elementProxyLocatorHandler;
    }

    /**
     *
     */
    public addLocator(locator: ElementProxyLocator) {
        if (this.locators.has(locator.strategy)) {
            throw new Error(`locator for strategy ${locator.strategy} already exists`);
        }

        this.locators.set(locator.strategy, locator);
    }

    /**
     *
     */
    public findLocator(strategy: string): ElementProxyLocator | null {
        if (!this.locators.has(strategy)) {
            throw new Error(`locator for strategy ${strategy} does not exist`);
        }

        return this.locators.get(strategy);
    }

    /**
     *
     */
    public getAll(): ElementProxyLocator[] {
        return Array.from(this.locators.values());
    }
}
