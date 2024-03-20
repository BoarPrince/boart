import { ElementAdapter, ElementPosition, UIElementProxy } from '@boart/ui';
import { SeleniumElementAdapter } from '../element-adapter/SeleniumElementAdapter';

/**
 *
 */
export abstract class DefaultProxy implements UIElementProxy {
    public abstract readonly name: string;
    public abstract readonly tagName: string;
    public readonly position: ElementPosition;
    public readonly proxy = this;
    public order = 10;

    /**
     *
     */
    protected get defaultOrder(): number {
        return this.order;
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isMatching(_: ElementAdapter): Promise<boolean> {
        return Promise.resolve(true);
    }

    /**
     *
     */
    abstract getElementByMatchingText(text: string, parentElement: ElementAdapter): Promise<ElementAdapter>;

    /**
     *
     */
    getElement(element: ElementAdapter): Promise<ElementAdapter> {
        return Promise.resolve(element);
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
    getText(element: SeleniumElementAdapter): Promise<string> {
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
