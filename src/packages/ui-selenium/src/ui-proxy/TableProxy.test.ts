import { UIElementTableProxy, WebPageAdapter, WebPageAdapterHandler } from '@boart/ui';
import initialize from '../index';

/**
 *
 */
describe('table-proxy', () => {
    let pageAdapter: WebPageAdapter<unknown>;

    /**
     *
     */
    beforeAll(async () => {
        initialize();
        const pageAdapterCreator = WebPageAdapterHandler.instance.getPageAdapterCreator('selenium.chromium.standalone');
        pageAdapter = await pageAdapterCreator();
    });

    /**
     *
     */
    afterAll(async () => {
        await pageAdapter.driver.clear();
    });

    /**
     *
     */
    test('must be button proxy', async () => {
        await pageAdapter.driver.html(`
          <table id="test-id">
            <caption>test-text</caption>
            <tr>
              <th>cell-1.1</th>
              <th>cell-1.2</th>
            </tr>
            <tr>
            <th>cell-2.1</th>
            <th>cell-2.2</th>
          </table>`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        expect(sut.name).toBe('table');
    });

    /**
     *
     */
    test('must not be visible', async () => {
        await pageAdapter.driver.html('<table hidden id="test-id"></table>');
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isDisplayed(element)).resolves.toBeFalsy();
    });

    /**
     *
     */
    test('must be enabled even the table is disabled', async () => {
        await pageAdapter.driver.html('<table disabled id="test-id"></table>');
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isEnabled(element)).resolves.toBeTruthy();
    });

    /**
     *
     */
    test('text must be available', async () => {
        await pageAdapter.driver.html('<table id="test-id"><caption>test-table</caption></table>');
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.getText(element)).resolves.toBe('test-table');
    });

    /**
     *
     */
    test('classes must be visible', async () => {
        await pageAdapter.driver.html('<table id="test-id" class="test1 test2"></table>');
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.getClasses(element)).resolves.toStrictEqual(['test1', 'test2']);
    });

    /**
     *
     */
    test('element must be locatable by text', async () => {
        await pageAdapter.driver.html('<table><caption>test-table</caption></table>');
        const element = await pageAdapter.element.locator.findBy('text', 'test-table');

        const sut = await pageAdapter.element.getProxy(element);
        expect(sut.name).toBe('table');
    });

    /**
     *
     */
    test('element info must be accessible', async () => {
        await pageAdapter.driver.html(`
          <table id="test-id" class="clazz1 clazz2">
            <caption>test-text</caption>
            <tr>
              <th>cell-1.1</th>
              <th>cell-1.2</th>
            </tr>
            <tr>
            <th>cell-2.1</th>
            <th>cell-2.2</th>
          </table>`);
        const element = await pageAdapter.element.byId('test-id');

        const sutElementInfo = await pageAdapter.element.getElementInfo(element);
        expect(sutElementInfo).toStrictEqual({
            ident: 'id:test-id',
            classes: ['clazz1', 'clazz2'],
            isDisplayed: true,
            isEditable: true,
            isEnabled: true,
            isSelected: false,
            proxyName: 'table',
            tagName: 'table',
            value: 'test-text',
            text: 'test-text',
            tableInfo: {
                columns: 2,
                rows: 2,
                visibleColumns: 2,
                visibleRows: 2
            }
        });
    });

    /**
     *
     */
    test('text of cell element', async () => {
        await pageAdapter.driver.html(`
          <table id="test-id">
            <caption>test-text</caption>
            <tr>
              <th>cell-1.1</th>
              <th>cell-1.2</th>
            </tr>
            <tr>
            <th>cell-2.1</th>
            <th>cell-2.2</th>
          </table>`);

        const element = await pageAdapter.element.byId('test-id');
        const sut = await pageAdapter.element.getProxy(element);

        await expect((sut as UIElementTableProxy).actions({ row: 0, column: 0 }).getText(element)).resolves.toBe('cell-1.1');
    });

    /**
     *
     */
    test('cell element is hidden', async () => {
        await pageAdapter.driver.html(`
          <table id="test-id">
            <caption>test-text</caption>
            <tr>
              <th hidden>cell-1.1</th>
              <th>cell-1.2</th>
            </tr>
            <tr>
            <th>cell-2.1</th>
            <th>cell-2.2</th>
          </table>`);

        const element = await pageAdapter.element.byId('test-id');
        const sut = await pageAdapter.element.getProxy(element);

        await expect((sut as UIElementTableProxy).actions({ row: 0, column: 0 }).isDisplayed(element)).resolves.toBeFalsy();
    });

    /**
     *
     */
    test('cell element is editable', async () => {
        await pageAdapter.driver.html(`
          <table id="test-id">
            <tr>
              <th contenteditable="true">cell-1.1</th>
              <th>cell-1.2</th>
            </tr>
            <tr>
            <th>cell-2.1</th>
            <th>cell-2.2</th>
          </table>`);

        const element = await pageAdapter.element.byId('test-id');
        const sut = await pageAdapter.element.getProxy(element);

        await expect((sut as UIElementTableProxy).actions({ row: 0, column: 0 }).isEditable(element)).resolves.toBeTruthy();
    });

    /**
     *
     */
    test('change cell value', async () => {
        await pageAdapter.driver.html(`
          <table id="test-id">
            <tr>
              <th contenteditable>cell-1.1</th>
              <th>cell-1.2</th>
            </tr>
            <tr>
              <td>cell-2.1</td>
              <td>cell-2.2</td>
            </tr>
          </table>`);

        const element = await pageAdapter.element.byId('test-id');
        const sut = await pageAdapter.element.getProxy(element);

        const actionElement = (sut as UIElementTableProxy).actions({ row: 0, column: 0 });
        await actionElement.setValue('new value', element);

        await expect(actionElement.getValue(element)).resolves.toBe('new value');
    });

    /**
     *
     */
    test('table does not have rows', async () => {
        await pageAdapter.driver.html(`
          <table id="test-id">
          </table>`);

        const element = await pageAdapter.element.byId('test-id');
        const sut = await pageAdapter.element.getProxy(element);

        const actionElement = (sut as UIElementTableProxy).actions({ row: 0, column: 0 });
        await expect(actionElement.getValue(element)).rejects.toThrow(
            `table: 'id:test-id' does not have row with index: 0, only 0 rows found`
        );
    });

    /**
     *
     */
    test('row position cannot be outside', async () => {
        await pageAdapter.driver.html(`
          <table id="test-id">
            <tr>
              <th >cell-1.1</th>
              <th>cell-1.2</th>
            </tr>
            <tr>
              <td>cell-2.1</td>
              <td>cell-2.2</td>
            </tr>
          </table>`);

        const element = await pageAdapter.element.byId('test-id');
        const sut = await pageAdapter.element.getProxy(element);

        const actionElement = (sut as UIElementTableProxy).actions({ row: 2, column: 0 });
        await expect(actionElement.getValue(element)).rejects.toThrow(
            `table: 'id:test-id' does not have row with index: 2, only 2 rows found`
        );
    });

    /**
     *
     */
    test('column position cannot be outside', async () => {
        await pageAdapter.driver.html(`
          <table id="test-id">
            <tr>
              <th >cell-1.1</th>
              <th>cell-1.2</th>
            </tr>
            <tr>
              <td>cell-2.1</td>
              <td>cell-2.2</td>
            </tr>
          </table>`);

        const element = await pageAdapter.element.byId('test-id');
        const sut = await pageAdapter.element.getProxy(element);

        const actionElement = (sut as UIElementTableProxy).actions({ row: 0, column: 2 });
        await expect(actionElement.getValue(element)).rejects.toThrow(
            `table: 'id:test-id' does not have column with index: 2, only 2 columns found`
        );
    });

    /**
     *
     */
    test('get info from cell element', async () => {
        await pageAdapter.driver.html(`
          <table id="test-id">
            <caption>test-text</caption>
            <tr>
              <th class="clazz1 clazz2">cell-1.1</th>
              <th>cell-1.2</th>
            </tr>
            <tr>
              <td>cell-2.1</td>
              <td>cell-2.2</td>
            </tr>
          </table>`);

        const element = await pageAdapter.element.byId('test-id');

        const sutElementInfo = await pageAdapter.element.getElementInfo(element, { row: 0, column: 0 });

        expect(sutElementInfo).toStrictEqual({
            ident: 'id:test-id',
            classes: ['clazz1', 'clazz2'],
            isDisplayed: true,
            isEditable: false,
            isEnabled: true,
            isSelected: false,
            proxyName: 'table',
            tagName: 'th',
            value: 'cell-1.1',
            text: 'cell-1.1',
            tableInfo: undefined
        });
    });
});
