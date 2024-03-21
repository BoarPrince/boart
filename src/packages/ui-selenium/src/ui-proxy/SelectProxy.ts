import { ElementAdapter } from '@boart/ui';
import { SeleniumElementAdapter } from '../element-adapter/SeleniumElementAdapter';
import { DefaultProxy } from './DefaultProxy';
import { SeleniumElementLocatorAdapter } from '../element-adapter/SeleniumElementLocatorAdapter';
import { By } from 'selenium-webdriver';

/**
 *
 */
export class SelectProxy extends DefaultProxy {
    public readonly name = 'select';
    public readonly tagName = 'select';

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

        const select = await parentElement.nativeElement.findElements(By.id(forAttribute));
        if (select.length === 0) {
            return null;
        }

        if ((await select[0].getTagName()) !== 'select') {
            return null;
        }

        return new SeleniumElementAdapter(select[0], `text: ${text}`);
    }

    /**
     *
     */
    setValue(value: string, element: SeleniumElementAdapter): Promise<void> {
        return element.nativeElement.getDriver().executeScript(
            `   const selectElement = arguments[0];
                const value = arguments[1];
                const options = Array.from(selectElement.options);

                const option = options //
                    .find((option) => option.value === value || option.text === value);

                if (option) {
                    option.selected = true;
                }
            `,
            element.nativeElement,
            value
        );
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
        return element.nativeElement.getDriver().executeScript(
            `   const selectElement = arguments[0];
                const index = selectElement.options.selectedIndex;
                const options = Array.from(selectElement.options);

                return index == null ? '' : options[index].text;`,
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
