import { ElementAdapter } from '@boart/ui';
import { SeleniumElementAdapter } from '../element-adapter/SeleniumElementAdapter';
import { DefaultProxy } from './DefaultProxy';

/**
 *
 */
export class InputProxy extends DefaultProxy {
    public readonly name = 'input';
    public readonly tagName = 'input';
    public readonly order = 0;

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

    /**
     *
     */
    isSelected(): Promise<boolean> {
        return Promise.resolve(false);
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
    getClasses(element: ElementAdapter): Promise<string[]> {
        return null;
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
