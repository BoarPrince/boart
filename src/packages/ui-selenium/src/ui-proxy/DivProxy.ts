import { ElementAdapter } from '@boart/ui';
import { SeleniumElementAdapter } from '../element-adapter/SeleniumElementAdapter';
import { DefaultProxy } from './DefaultProxy';

/**
 *
 */
export class DivProxy extends DefaultProxy {
    public readonly name = 'div';
    public readonly tagName = 'div';
    public readonly order = 0;

    /**
     *
     */
    async getElementByMatchingText(text: string, parentElement: SeleniumElementAdapter): Promise<ElementAdapter> {
        const xPaths = [`.//div[text()[normalize-space() = "${text}"]]`];
        return await SeleniumElementAdapter.getElement(xPaths, parentElement);
    }

    /**
     *
     */
    async isEditable(element: SeleniumElementAdapter): Promise<boolean> {
        const isEditable = await element.nativeElement.getAttribute('contenteditable');
        return isEditable != null;
    }
}
