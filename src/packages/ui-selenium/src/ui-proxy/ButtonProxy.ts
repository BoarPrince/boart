import { ElementAdapter } from '@boart/ui';
import { SeleniumElementAdapter } from '../element-adapter/SeleniumElementAdapter';
import { DefaultProxy } from './DefaultProxy';

/**
 *
 */
export class ButtonProxy extends DefaultProxy {
    public readonly name = 'button';
    public readonly tagName = 'button';

    /**
     *
     */
    async getElementByMatchingText(text: string, parentElement: ElementAdapter): Promise<ElementAdapter> {
        const xPaths = [
            `//button[.//*[text()[normalize-space() = "${text}"]]]`, //
            `//button[text()[normalize-space() = "${text}"]]`
        ];
        return await SeleniumElementAdapter.getElement(xPaths, parentElement);
    }
}
