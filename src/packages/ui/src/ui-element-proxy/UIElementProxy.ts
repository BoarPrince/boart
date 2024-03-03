import { ElementAdapter } from '../element-adapter/ElementAdapter';

/**
 *
 */
export interface UIElementProxy {
    /**
     *
     */
    readonly name: string;

    /**
     *
     */
    readonly order: number;

    /**
     *
     */
    getElement(): Promise<ElementAdapter>;

    /**
     *
     */
    isMatching(element: ElementAdapter): Promise<boolean>;

    /**
     *
     */
    getElementByMatchingText(text?: string): Promise<ElementAdapter>;

    /**
     *
     */
    isDisplayed(): Promise<boolean>;

    /**
     *
     */
    isEnabled(): Promise<boolean>;

    /**
     *
     */
    requestFocus(element: ElementAdapter): Promise<void>;

    /**
     *
     */
    setControlValue(value: string, element: ElementAdapter): Promise<void>;

    /**
     *
     */
    setValue(value: string, element: ElementAdapter): Promise<void>;

    /**
     *
     */
    click(element: ElementAdapter): Promise<void>;
}
