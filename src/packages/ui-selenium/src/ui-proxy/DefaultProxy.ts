import { ElementAdapter, UIElementProxy } from '@boart/ui';
import { SeleniumElementAdapter } from '../element-adapter/SeleniumElementAdapter';

/**
 *
 */
export abstract class DefaultProxy implements UIElementProxy {
    public abstract readonly name: string;
    public abstract readonly tagName: string;
    public readonly order = 10;

    /**
     *
     */
    isMatching(): Promise<boolean> {
        return Promise.resolve(true);
    }

    /**
     *
     */
    abstract getElementByMatchingText(text: string, parentElement: ElementAdapter): Promise<ElementAdapter>;

    /**
     *
     */
    isSelected(element: SeleniumElementAdapter): Promise<boolean> {
        return element.nativeElement.isSelected();
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
