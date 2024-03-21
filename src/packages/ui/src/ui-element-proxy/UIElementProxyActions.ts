import { ElementAdapter } from '../element-adapter/ElementAdapter';
import { ElementPosition } from './ElementPosition';
import { UIElementProxy } from './UIElementProxy';

/**
 *
 */
export interface UIElementProxyActions {
    /**
     *
     */
    readonly proxy: UIElementProxy;

    /**
     *
     */
    readonly position: ElementPosition;

    /**
     *
     */
    getElement(element: ElementAdapter): Promise<ElementAdapter>;

    /**
     *
     */
    getClasses(element: ElementAdapter): Promise<string[]>;

    /**
     *
     */
    isSelected(element: ElementAdapter): Promise<boolean>;

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
    isReadonly(element: ElementAdapter): Promise<boolean>;

    /**
     *
     */
    isRequired(element: ElementAdapter): Promise<boolean>;

    /**
     *
     */
    getValue(element: ElementAdapter): Promise<string>;

    /**
     *
     */
    getText(element: ElementAdapter): Promise<string>;

    /**
     *
     */
    setValue(value: string, element: ElementAdapter): Promise<void>;

    /**
     *
     */
    click(element: ElementAdapter): Promise<void>;
}
