import { ElementPosition, UIElementProxy, UIElementProxyActions } from '@boart/ui';
import { SeleniumElementAdapter } from '../element-adapter/SeleniumElementAdapter';
import { WebElement } from 'selenium-webdriver';

/**
 *
 */
export class DefaultPositionProxyActions implements UIElementProxyActions {
    /**
     *
     */
    constructor(
        public readonly position: ElementPosition,
        public readonly proxy: UIElementProxy
    ) {}

    /**
     *
     */
    private getPositionedElement(element: SeleniumElementAdapter): Promise<WebElement> {
        return element.nativeElement.getDriver().executeScript(
            `const tableElement = arguments[0];
             const position = arguments[1];

             if(tableElement.rows.length <= position.row) {
                throw new Error('table does not have row with index ' + position.row);
             }

             if(tableElement.rows.item(0).cells.length <= position.column) {
                throw new Error('table does not have column with index ' + position.column);
             }

             return tableElement.rows.item(position.row)?.cells.item(position.column);`,
            element.nativeElement,
            this.position
        );
    }

    /**
     *
     */
    async getElement(element: SeleniumElementAdapter): Promise<SeleniumElementAdapter> {
        const location = (await element.getLocation()) + `[${this.position.row}][${this.position.column}]`;
        return new SeleniumElementAdapter(await this.getPositionedElement(element), location);
    }

    /**
     *
     */
    async isSelected(element: SeleniumElementAdapter): Promise<boolean> {
        return (await this.getPositionedElement(element)).isSelected();
    }

    /**
     *
     */
    async isEditable(element: SeleniumElementAdapter): Promise<boolean> {
        const getPositionedElement = await this.getPositionedElement(element);
        const isEditable = await getPositionedElement.getAttribute('contenteditable');
        return isEditable != null;
    }

    /**
     *
     */
    async isDisplayed(element: SeleniumElementAdapter): Promise<boolean> {
        return (await this.getPositionedElement(element)).isDisplayed();
    }

    /**
     *
     */
    async isEnabled(element: SeleniumElementAdapter): Promise<boolean> {
        return (await this.getPositionedElement(element)).isDisplayed();
    }

    /**
     *
     */
    async getClasses(element: SeleniumElementAdapter): Promise<string[]> {
        const classes = (await this.getPositionedElement(element)).getAttribute('class');
        return classes.then((value) => value.split(/\s+/));
    }

    /**
     *
     */
    async getValue(element: SeleniumElementAdapter): Promise<string> {
        return (await this.getPositionedElement(element)).getText();
    }

    /**
     *
     */
    async getText(element: SeleniumElementAdapter): Promise<string> {
        return (await this.getPositionedElement(element)).getText();
    }

    /**
     *
     */
    async setValue(value: string, element: SeleniumElementAdapter): Promise<void> {
        const cellElement = await this.getPositionedElement(element);
        await cellElement.clear();
        await cellElement.sendKeys(value);
    }

    /**
     *
     */
    async click(element: SeleniumElementAdapter): Promise<void> {
        const cellElement = await this.getPositionedElement(element);
        await cellElement.click();
    }
}
