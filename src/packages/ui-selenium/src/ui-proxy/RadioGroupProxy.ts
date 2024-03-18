import { ElementAdapter } from '@boart/ui';
import { SeleniumElementAdapter } from '../element-adapter/SeleniumElementAdapter';
import { DefaultProxy } from './DefaultProxy';
import { By, WebElement } from 'selenium-webdriver';

/**
 *
 */
export class RadioGroupProxy extends DefaultProxy {
    public readonly name = 'radio-group';
    public readonly tagName = '*';
    public readonly order = super.defaultOrder + 20;

    /**
     *
     */
    private getChildElements(element: SeleniumElementAdapter): Promise<WebElement[]> {
        return element.nativeElement.findElements(By.xpath('.//input[@type="radio"]'));
    }

    /**
     *
     */
    private async getSelectedElement(element: SeleniumElementAdapter): Promise<WebElement> {
        const childs = await this.getChildElements(element);
        const name = await childs[0].getAttribute('name');

        const radioElements = await element.nativeElement.getDriver().findElements(By.name(name));

        for (const radioElement of radioElements) {
            if (await radioElement.isSelected()) {
                return radioElement;
            }
        }

        return null;
    }

    /**
     *
     */
    async isMatching(element: SeleniumElementAdapter): Promise<boolean> {
        const childs = await this.getChildElements(element);

        // check if all child radios have the same name
        const names = await Promise.all(childs.map((radioChild) => radioChild.getAttribute('name')));
        return new Set(names).size == 1;
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
    async getValue(element: SeleniumElementAdapter): Promise<string> {
        const selectedElement = await this.getSelectedElement(element);
        if (!selectedElement) {
            return '';
        } else {
            return await selectedElement.getAttribute('value');
        }
    }

    /**
     *
     */
    async getText(element: SeleniumElementAdapter): Promise<string> {
        const selectedElement = await this.getSelectedElement(element);
        if (!selectedElement) {
            return '';
        } else {
            return element.nativeElement.getDriver().executeScript(
                `const radioElement = arguments[0];
                 return !radioElement.labels?.length ? '' : radioElement.labels[0].textContent;`,
                selectedElement
            );
        }
    }

    /**
     *
     */
    async isSelected(element: SeleniumElementAdapter): Promise<boolean> {
        return (await this.getSelectedElement(element)) != null;
    }

    /**
     *
     */
    async setValue(value: string, element: SeleniumElementAdapter): Promise<void> {
        const childs = await this.getChildElements(element);
        for (const child of childs) {
            if ((await child.getAttribute('value')) === value) {
                await child.click();
                return;
            }
        }

        throw new Error(`could not find radio with value: '${value}'`);
    }
}
