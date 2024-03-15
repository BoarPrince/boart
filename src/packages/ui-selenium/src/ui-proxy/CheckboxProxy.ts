import { ElementAdapter, UIElementProxy } from '@boart/ui';
import { SeleniumElementAdapter } from '../element-adapter/SeleniumElementAdapter';

/**
 *
 */
export class CheckboxProxy implements UIElementProxy {
    public readonly name = 'check-box';
    public readonly tagName = 'input';
    public readonly order = 5;

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
        return (await element.nativeElement.getAttribute('value')) || //
            (await element.nativeElement.isSelected())
            ? 'true'
            : 'false';
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
