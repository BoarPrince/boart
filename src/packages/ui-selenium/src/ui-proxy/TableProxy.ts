import { ElementAdapter, ElementPosition, UIElementProxyActions } from '@boart/ui';
import { SeleniumElementAdapter } from '../element-adapter/SeleniumElementAdapter';
import { DefaultTableProxy } from './DefaultTableProxy';
import { DefaultPositionProxyActions } from './DefaultPositionProxyActions';
import { By } from 'selenium-webdriver';

/**
 *
 */
class TableActionProxy extends DefaultPositionProxyActions {}

/**
 *
 */
export class TableProxy extends DefaultTableProxy {
    public readonly name = 'table';
    public readonly tagName = 'table';
    public readonly order = super.defaultOrder + 10;

    /**
     *
     */
    async getElementByMatchingText(text: string, parentElement: ElementAdapter): Promise<ElementAdapter> {
        const xPaths = [`//table[//*[not(th)][not(td)][not(tr)]//text()[normalize-space() = "${text}"]]`];
        return await SeleniumElementAdapter.getElement(xPaths, parentElement);
    }

    /**
     *
     */
    async getValue(element: SeleniumElementAdapter): Promise<string> {
        const textElement = await element.nativeElement.findElements(By.xpath('//table//*[not(th)][not(td)][not(tr)]'));
        if (textElement.length > 0) {
            return textElement[0].getText();
        }
        return '';
    }

    /**
     *
     */
    getText(element: SeleniumElementAdapter): Promise<string> {
        return this.getValue(element);
    }

    /**
     *
     */
    getRows(element: SeleniumElementAdapter): Promise<number> {
        return element.nativeElement.getDriver().executeScript(
            `const tableElement = arguments[0];
             return tableElement.rows.length;`,
            element.nativeElement
        );
    }

    /**
     *
     */
    getColumns(element: SeleniumElementAdapter): Promise<number> {
        return element.nativeElement.getDriver().executeScript(
            `const tableElement = arguments[0];
             return Array.from(tableElement.rows).find(() => true)?.cells.length;`,
            element.nativeElement
        );
    }

    /**
     *
     */
    getVisibleRows(element: SeleniumElementAdapter): Promise<number> {
        return this.getRows(element);
    }

    /**
     *
     */
    getVisibleColumns(element: SeleniumElementAdapter): Promise<number> {
        return this.getColumns(element);
    }

    /**
     *
     */
    actions = (position: ElementPosition): UIElementProxyActions => new TableActionProxy(position, this);
}
