import { ElementAdapter } from '@boart/ui';
import { SeleniumElementAdapter } from '../element-adapter/SeleniumElementAdapter';
import { DefaultProxy } from './DefaultProxy';
import { SeleniumElementLocatorAdapter } from '../element-adapter/SeleniumElementLocatorAdapter';
import { By } from 'selenium-webdriver';

/**
 *
 */
export class RadioProxy extends DefaultProxy {
    public readonly name = 'radio';
    public readonly tagName = 'input';
    public readonly order = super.defaultOrder + 5;

    /**
     *
     */
    async isMatching(element: SeleniumElementAdapter): Promise<boolean> {
        const inputType = await element.nativeElement.getAttribute('type');
        return inputType === 'radio';
    }

    /**
     *
     */
    async getElementByMatchingText(text: string, parentElement: SeleniumElementLocatorAdapter): Promise<ElementAdapter> {
        const xPaths = `//label[text()[normalize-space() = "${text}"]]`;
        const labels = await parentElement.nativeElement.findElements(By.xpath(xPaths));
        if (labels.length === 0) {
            return null;
        }

        const forAttribute = await labels[0].getAttribute('for');

        if (!forAttribute) {
            return null;
        }

        const radio = await parentElement.nativeElement.findElements(By.id(forAttribute));
        if (radio.length === 0) {
            return null;
        }

        if ((await radio[0].getTagName()) !== 'input' || (await radio[0].getAttribute('type')) !== 'radio') {
            return null;
        }

        return new SeleniumElementAdapter(radio[0], `text: ${text}`);
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
    getText(element: SeleniumElementAdapter): Promise<string> {
        return element.nativeElement.getDriver().executeScript(
            `
            const radioElement = arguments[0];
            return !radioElement.labels?.length ? '' : radioElement.labels[0].textContent;`,
            element.nativeElement
        );
    }

    /**
     *
     */
    async isRequired(element: SeleniumElementAdapter): Promise<boolean> {
        return (await element.nativeElement.getAttribute('required')) != null;
    }
}
