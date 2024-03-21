import { UIElementProxyInfo, WebPageAdapter, WebPageAdapterHandler } from '@boart/ui';
import initialize from '../index';

/**
 *
 */
describe('radio-group-proxy', () => {
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
    test('must be a radio group proxy', async () => {
        await pageAdapter.driver.html(`
        <div id="test-id">
          <input type="radio" id="test-id-1" name="test-name" value="test-value-1">
          <input type="radio" id="test-id-2" name="test-name" value="test-value-2">
        </div>`);

        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        expect(sut.name).toBe('radio-group');
    });

    /**
     *
     */
    test('must be a radio group proxy - with deep nesting', async () => {
        await pageAdapter.driver.html(`
        <div id="test-id">
          <div>
            <input type="radio" id="test-id-1" name="test-name" value="test-value-1">
            <input type="radio" id="test-id-2" name="test-name" value="test-value-2">
          </div>
        </div>`);

        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        expect(sut.name).toBe('radio-group');
    });

    /**
     *
     */
    test('must not be visible', async () => {
        await pageAdapter.driver.html(`
          <div id="test-id" hidden>
            <input type="radio" id="test-id-1" name="test-name" value="test-value-1">
            <input type="radio" id="test-id-2" name="test-name" value="test-value-2">
          </div>`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isDisplayed(element)).resolves.toBeFalsy();
    });

    /**
     *
     */
    test('text must not be available - because of hidden', async () => {
        await pageAdapter.driver.html(`
        <div id="test-id" hidden>
          <input type="radio" id="test-id-1" name="test-name" value="test-value-1">
          <input checked type="radio" id="test-id-2" name="test-name" value="test-value-2">
        </div>`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);

        await expect(sut.getText(element)).resolves.toBe('');
    });

    test('text must not be available - because of not checked', async () => {
        await pageAdapter.driver.html(`
        <div id="test-id">
          <input type="radio" id="test-id-1" name="test-name" value="test-value-1">
          <input type="radio" id="test-id-2" name="test-name" value="test-value-2">
        </div>`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);

        await expect(sut.getText(element)).resolves.toBe('');
    });

    /**
     *
     */
    test('text must be available', async () => {
        await pageAdapter.driver.html(`
          <div id="test-id">
            <input type="radio" id="test-id-1" name="test-name" value="test-value-1"><label for="test-id-1">Test-Value-1</label>
            <input checked type="radio" id="test-id-2" name="test-name" value="test-value-2"><label for="test-id-2">Test-Value-2</label>
          </div>`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);

        await expect(sut.getText(element)).resolves.toBe('Test-Value-2');
    });

    /**
     *
     */
    test('text must be empty if not label is defined', async () => {
        await pageAdapter.driver.html(`
          <div id="test-id">
            <input type="radio" id="test-id-1" name="test-name" value="test-value-1">
            <input checked type="radio" id="test-id-2" name="test-name" value="test-value-2">
          </div>`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);

        await expect(sut.getText(element)).resolves.toBe('');
    });

    /**
     *
     */
    test('value must be available', async () => {
        await pageAdapter.driver.html(`
        <div id="test-id">
          <input type="radio" id="test-id-1" name="test-name" value="test-value-1">
          <input checked type="radio" id="test-id-2" name="test-name" value="test-value-2">
        </div>`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.getValue(element)).resolves.toBe('test-value-2');
    });

    /**
     *
     */
    test('classes must be visible', async () => {
        await pageAdapter.driver.html(`
          <div id="test-id" class="test1 test2">
            <input type="radio" id="test-id-1" name="test-name" value="test-value-1">
            <input checked type="radio" id="test-id-2" name="test-name" value="test-value-2">
          </div>`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.getClasses(element)).resolves.toStrictEqual(['test1', 'test2']);
    });

    /**
     *
     */
    test('element is not locatable by text', async () => {
        await pageAdapter.driver.html(`
          <div id="test-id" class="test1 test2">
            <input type="radio" id="test-id-1" name="test-name" value="test-value-1">
            <input checked type="radio" id="test-id-2" name="test-name" value="test-value-2">
          </div>`);

        await expect(pageAdapter.element.locator.findBy('text', 'Test-Text')).rejects.toThrow(
            `element 'Test-Text' by strategy findBy:text not found!`
        );
    });

    /**
     *
     */
    test('element info must be accessible', async () => {
        await pageAdapter.driver.html(`
          <div id="test-id" class="clazz1 clazz2">
            <input type="radio" id="test-id-1" name="test-name" value="test-value-1"><label for="test-id-1">Test-Value-1</label>
            <input checked type="radio" id="test-id-2" name="test-name" value="test-value-2"><label for="test-id-2">Test-Value-2</label>
          </div>`);
        const element = await pageAdapter.element.byId('test-id');

        const sutElementInfo = await pageAdapter.element.getElementInfo(element);
        expect(sutElementInfo).toStrictEqual<UIElementProxyInfo>({
            ident: 'id:test-id',
            classes: ['clazz1', 'clazz2'],
            isDisplayed: true,
            isEditable: true,
            isEnabled: true,
            isSelected: true,
            isReadonly: undefined,
            isRequired: undefined,
            proxyName: 'radio-group',
            tagName: 'div',
            value: 'test-value-2',
            text: 'Test-Value-2',
            tableInfo: undefined
        });
    });

    /**
     *
     */
    test('set value selects the specified radio element', async () => {
        await pageAdapter.driver.html(`
          <div id="test-id">
            <input checked type="radio" id="test-id-1" name="test-name" value="test-value-1">
            <input type="radio" id="test-id-2" name="test-name" value="test-value-2">
          </div>`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);

        await expect(sut.getValue(element)).resolves.toBe('test-value-1');
        await sut.setValue('test-value-2', element);

        await expect(sut.getValue(element)).resolves.toBe('test-value-2');
    });

    /**
     *
     */
    test(`set value occurs an error if value can't be found`, async () => {
        await pageAdapter.driver.html(`
          <div id="test-id">
            <input checked type="radio" id="test-id-1" name="test-name" value="test-value-1">
            <input type="radio" id="test-id-2" name="test-name" value="test-value-2">
          </div>`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);

        await expect(() => sut.setValue('test-value-3', element)).rejects.toThrow(`could not find radio with value: 'test-value-3'`);
    });
});
