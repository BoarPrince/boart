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
    getElementByMatchingText(text: string, parentElement: ElementAdapter): Promise<ElementAdapter>;

    /**
     *
     */
    isEditable(element: ElementAdapter): Promise<boolean>;

    /**
     *
     */
    isDisplayed(element: ElementAdapter): Promise<boolean>;

    /**
     *
     */
    isEnabled(element: ElementAdapter): Promise<boolean>;

    /**
     *
     */
    getValue(element: ElementAdapter): Promise<string>;

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
