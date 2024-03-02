import { UIErrorIndicator } from './UIErrorIndicator';

/**
 *
 */
export class UIErrorIndicatorHandler {
    /**
     *
     */
    private indicators = new Map<string, UIErrorIndicator>();

    /**
     *
     */
    constructor() {}

    /**
     *
     */
    public static get instance(): UIErrorIndicatorHandler {
        if (!globalThis._uiProgressIndicatorHandlerInstance) {
            globalThis._uiErrorIndicatorHandlerInstance = new UIErrorIndicatorHandler();
        }

        return globalThis._uiErrorIndicatorHandlerInstance;
    }

    /**
     *
     */
    public addIndicator(indicator: UIErrorIndicator) {
        if (this.indicators.has(indicator.name)) {
            throw new Error(`error indicator with name = '${indicator.name}' already exists!`);
        }

        this.indicators.set(indicator.name, indicator);
    }

    /**
     *
     */
    public getIndicator(name: string): UIErrorIndicator {
        if (!this.indicators.has(name)) {
            throw new Error(`error indicator with name = '${name}' not found!`);
        }
        return this.indicators.get(name);
    }

    /**
     *
     */
    public getAll(): Array<UIErrorIndicator> {
        return Array.from(this.indicators.values());
    }
}
