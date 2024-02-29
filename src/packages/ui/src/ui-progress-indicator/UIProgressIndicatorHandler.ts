import { UIProgressIndicator } from './UIProgressIndicator';

/**
 *
 */
export class UIProgressIndicatorHandler {
    /**
     *
     */
    private indicators = new Map<string, UIProgressIndicator>();

    /**
     *
     */
    constructor() {}

    /**
     *
     */
    public static get instance(): UIProgressIndicatorHandler {
        if (!globalThis._uiProgressIndicatorHandlerInstance) {
            globalThis._uiProgressIndicatorHandlerInstance = new UIProgressIndicatorHandler();
        }

        return globalThis._uiProgressIndicatorHandlerInstance;
    }

    /**
     *
     */
    public addIndicator(indicator: UIProgressIndicator) {
        if (this.indicators.has(indicator.name)) {
            throw new Error(`indicator with name = '${indicator.name}' already exists!`);
        }

        this.indicators.set(indicator.name, indicator);
    }

    /**
     *
     */
    public getIndicator(name: string): UIProgressIndicator {
        if (!this.indicators.has(name)) {
            throw new Error(`indicator with name = '${name}' not found!`);
        }
        return this.indicators.get(name);
    }

    /**
     *
     */
    public getAll(): Array<UIProgressIndicator> {
        return Array.from(this.indicators.values());
    }
}
