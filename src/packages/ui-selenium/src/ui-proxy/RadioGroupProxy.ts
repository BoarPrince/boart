import { ElementAdapter, UIElementProxy } from '@boart/ui';
import { SeleniumElementAdapter } from '../element-adapter/SeleniumElementAdapter';

/**
 *
 */
export class RadioProxy implements UIElementProxy {
    public readonly name = 'radio-group';
    public readonly tagName = '*';
    public readonly order = 5;

    /**
     *
     */
    async isMatching(element: SeleniumElementAdapter): Promise<boolean> {
        const inputType = await element.nativeElement.getAttribute('type');
        return inputType === 'radio';
    }

    /**
     *
     */
    getElementByMatchingText(): Promise<ElementAdapter> {
        return null;
    }

    /**
     *
     */
    isSelected(element: SeleniumElementAdapter): Promise<boolean> {
        return element.nativeElement.isSelected();
    }

    /**
     *
     */
    isEditable(): Promise<boolean> {
        return Promise.resolve(false);
    }

    /**
     *
     */
    isDisplayed(element: SeleniumElementAdapter): Promise<boolean> {
        return element.isDisplayed();
    }

    /**
     *
     */
    isEnabled(element: SeleniumElementAdapter): Promise<boolean> {
        return element.isEnabled();
    }

    /**
     *
     */
    getClasses(element: ElementAdapter): Promise<string[]> {
        return null;
    }

    /**
     *
     */
    async getValue(element: SeleniumElementAdapter): Promise<string> {
        return element.nativeElement.getAttribute('value');
    }

    /**
     *
     */
    async setControlValue(): Promise<void> {}

    /**
     *
     */
    async setValue(): Promise<void> {}

    /**
     *
     */
    async click(element: SeleniumElementAdapter): Promise<void> {
        await element.nativeElement.click();
    }
}
