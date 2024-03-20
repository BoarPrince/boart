import { ElementAdapter } from '@boart/ui';
import { SeleniumElementAdapter } from '../element-adapter/SeleniumElementAdapter';
import { DefaultProxy } from './DefaultProxy';
import { By } from 'selenium-webdriver';

/**
 *
 */
export class InputProxy extends DefaultProxy {
    public readonly name = 'input';
    public readonly tagName = 'input';

    /**
     *
     */
    private async tryGetAdapterByPlacehholder(text: string, parentElement: SeleniumElementAdapter): Promise<ElementAdapter> {
        const inputByPlaceholder = await parentElement.nativeElement.findElements(By.xpath(`//input[@placeholder = "${text}"]`));
        if (inputByPlaceholder.length > 0) {
            return new SeleniumElementAdapter(inputByPlaceholder[0], `text[@placeholder]: ${text}`);
        } else {
            return null;
        }
    }

    /**
     *
     */
    async getElementByMatchingText(text: string, parentElement: SeleniumElementAdapter): Promise<ElementAdapter> {
        const xPaths = `//label[text()[normalize-space() = "${text}"]]`;
        const labels = await parentElement.nativeElement.findElements(By.xpath(xPaths));
        if (labels.length === 0) {
            return this.tryGetAdapterByPlacehholder(text, parentElement);
        }

        const forAttribute = await labels[0].getAttribute('for');

        if (!forAttribute) {
            return this.tryGetAdapterByPlacehholder(text, parentElement);
        }

        const inputElement = await parentElement.nativeElement.findElements(By.id(forAttribute));
        if (inputElement.length === 0) {
            return this.tryGetAdapterByPlacehholder(text, parentElement);
        }

        if ((await inputElement[0].getTagName()) !== 'input') {
            return this.tryGetAdapterByPlacehholder(text, parentElement);
        }

        return new SeleniumElementAdapter(inputElement[0], `text[label]: ${text}`);
    }

    /**
     *
     */
    getValue(element: SeleniumElementAdapter): Promise<string> {
        return element.nativeElement.getAttribute('value');
    }

    /**
     *
     */
    async getText(element: SeleniumElementAdapter): Promise<string> {
        const text = await element.nativeElement.getDriver().executeScript<string>(
            `const radioElement = arguments[0];
            return !radioElement.labels?.length ? '' : radioElement.labels[0].textContent;`,
            element.nativeElement
        );

        if (text) {
            return text;
        } else {
            return await element.nativeElement.getAttribute('placeholder');
        }
    }
}
