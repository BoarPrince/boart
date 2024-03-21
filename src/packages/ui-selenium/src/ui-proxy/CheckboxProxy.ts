import { ElementAdapter } from '@boart/ui';
import { SeleniumElementAdapter } from '../element-adapter/SeleniumElementAdapter';
import { InputProxy } from './InputProxy';

/**
 *
 */
export class CheckboxProxy extends InputProxy {
    public readonly name = 'checkbox';
    public readonly tagName = 'input';
    public readonly order = super.defaultOrder + 5;

    /**
     *
     */
    async isMatching(element: SeleniumElementAdapter): Promise<boolean> {
        const inputType = await element.nativeElement.getAttribute('type');
        return inputType === 'checkbox';
    }

    /**
     *
     */
    async getElementByMatchingText(text: string, parentElement: SeleniumElementAdapter): Promise<ElementAdapter> {
        return this.getElementByMatchingTextAndType(text, parentElement, 'checkbox');
    }

    /**
     *
     */
    isReadonly(): Promise<boolean> {
        return undefined;
    }
}
