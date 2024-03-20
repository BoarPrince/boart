import { ElementAdapter } from '@boart/ui';
import { SeleniumElementAdapter } from '../element-adapter/SeleniumElementAdapter';
import { DefaultProxy } from './DefaultProxy';

/**
 *
 */
export class InputSubmitButtonProxy extends DefaultProxy {
    public readonly name = 'input-submit-button';
    public readonly tagName = 'input';
    public readonly order = super.defaultOrder + 5;

    /**
     *
     */
    async isMatching(element: SeleniumElementAdapter): Promise<boolean> {
        const inputType = await element.nativeElement.getAttribute('type');
        return inputType === 'submit';
    }

    /**
     *
     */
    async getElementByMatchingText(text: string, parentElement: SeleniumElementAdapter): Promise<ElementAdapter> {
        const xPaths = [`//input[@type="submit"][@value="${text}"]`];
        return await SeleniumElementAdapter.getElement(xPaths, parentElement);
    }

    /**
     *
     */
    getValue(element: SeleniumElementAdapter): Promise<string> {
        return element.nativeElement.getAttribute('value');
    }

    /**
     *
     */
    getText(element: SeleniumElementAdapter): Promise<string> {
        return this.getValue(element);
    }
}
