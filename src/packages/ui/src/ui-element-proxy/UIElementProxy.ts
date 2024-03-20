import { ElementAdapter } from '../element-adapter/ElementAdapter';
import { UIElementProxyActions } from './UIElementProxyActions';

/**
 *
 */
export interface UIElementProxy extends UIElementProxyActions {
    /**
     *
     */
    readonly name: string;

    /**
     *
     */
    readonly tagName: string;

    /**
     *
     */
    readonly order: number;

    /**
     *
     */
    isMatching(element: ElementAdapter): Promise<boolean>;

    /**
     *
     */
    getElementByMatchingText(text: string, parentElement: ElementAdapter): Promise<ElementAdapter>;
}
