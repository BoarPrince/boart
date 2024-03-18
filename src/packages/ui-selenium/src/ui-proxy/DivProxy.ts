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
    isMatching(): Promise<boolean> {
        return Promise.resolve(true);
    }

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
    isSelected(): Promise<boolean> {
        return Promise.resolve(false);
    }

    /**
     *
     */
    async isEditable(element: SeleniumElementAdapter): Promise<boolean> {
        const isEditable = await element.nativeElement.getAttribute('contenteditable');
        return isEditable === 'true';
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
        return element.nativeElement.getText();
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
