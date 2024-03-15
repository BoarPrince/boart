import { ElementAdapter, UIElementProxy } from '@boart/ui';
import { SeleniumElementAdapter } from '../element-adapter/SeleniumElementAdapter';

/**
 *
 */
export class ButtonProxy implements UIElementProxy {
    public readonly name = 'button';
    public readonly tagName = 'button';
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
    async getElementByMatchingText(text: string, parentElement: ElementAdapter): Promise<ElementAdapter> {
        const xPaths = [
            `//button[.//*[text()[normalize-space() = "${text}"]]]`, //
            `//button[text()[normalize-space() = "${text}"]]`
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
    isEditable(element: ElementAdapter): Promise<boolean> {
        return element.isEnabled();
    }

    /**
     *
     */
    isDisplayed(element: ElementAdapter): Promise<boolean> {
        return element.isDisplayed();
    }

    /**
     *
     */
    isEnabled(element: ElementAdapter): Promise<boolean> {
        return element.isEnabled();
    }

    /**
     *
     */
    async getClasses(element: SeleniumElementAdapter): Promise<string[]> {
        const classes = await element.nativeElement.getAttribute('class');
        return classes.split(/\s+/);
    }

    /**
     *
     */
    getValue(element: SeleniumElementAdapter): Promise<string> {
        return element.nativeElement.getText();
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
