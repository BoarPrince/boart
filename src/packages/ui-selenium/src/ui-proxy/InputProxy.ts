import { ElementAdapter, UIElementProxy } from '@boart/ui';
import { SeleniumElementAdapter } from '../element-adapter/SeleniumElementAdapter';

/**
 *
 */
export class InputProxy implements UIElementProxy {
    public readonly name: 'input';
    public readonly order: 0;

    /**
     *
     */
    getElement(): Promise<ElementAdapter> {
        throw new Error('Method not implemented.');
    }

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
        const xPaths = [`//input[.//*[text()[normalize-space()="${text}"]]]`, `//input[@placeholder="${text}"]`];
        return await parentElement.getElement(xPaths);
    }

    /**
     *
     */
    isEditable(element: SeleniumElementAdapter): Promise<boolean> {
        return element.isEnabled();
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
    async getValue(element: SeleniumElementAdapter): Promise<string> {
        return element.nativeElement.getAttribute('value');
    }

    /**
     *
     */
    setControlValue(value: string, element: SeleniumElementAdapter): Promise<void> {
        return this.setValue(value, element);
    }

    /**
     *
     */
    async setValue(value: string, element: SeleniumElementAdapter): Promise<void> {
        await element.nativeElement.clear();
        await element.nativeElement.sendKeys(value);
    }

    /**
     *
     */
    async click(element: SeleniumElementAdapter): Promise<void> {
        await element.nativeElement.click();
    }
}
