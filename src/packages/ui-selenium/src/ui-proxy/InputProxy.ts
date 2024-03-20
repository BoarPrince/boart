import { ElementAdapter } from '@boart/ui';
import { SeleniumElementAdapter } from '../element-adapter/SeleniumElementAdapter';
import { DefaultProxy } from './DefaultProxy';

/**
 *
 */
export class InputProxy extends DefaultProxy {
    public readonly name = 'input';
    public readonly tagName = 'input';

    /**
     *
     */
    isMatching(): Promise<boolean> {
        return Promise.resolve(true);
    }

    /**
     *
     */
    async getElementByMatchingText(text: string, parentElement: SeleniumElementAdapter): Promise<ElementAdapter> {
        const xPaths = [
            `//input[.//*[text()[normalize-space()="${text}"]]]`, //
            `//input[@placeholder="${text}"]`
        ];
        return await SeleniumElementAdapter.getElement(xPaths, parentElement);
    }
}
