import { ElementProxy } from '../element-proxy/ElementProxy';

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
    getElement(): Promise<ElementProxy>;

    /**
     *
     */
    isMatching(element: ElementProxy): Promise<boolean>;

    /**
     *
     */
    getElementByMatchingText(text?: string): Promise<ElementProxy>;

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
    requestFocus(element: ElementProxy): Promise<void>;

    /**
     *
     */
    setControlValue(value: string, element: ElementProxy): Promise<void>;

    /**
     *
     */
    setValue(value: string, element: ElementProxy): Promise<void>;

    /**
     *
     */
    click(element: ElementProxy): Promise<void>;
}
