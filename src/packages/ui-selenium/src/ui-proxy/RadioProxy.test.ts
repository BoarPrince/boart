import { UIElementProxyInfo, WebPageAdapter, WebPageAdapterHandler } from '@boart/ui';
import initialize from '../index';

/**
 *
 */
describe('radio-proxy', () => {
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
    test('must be a radio proxy', async () => {
        await pageAdapter.driver.html(`<input type="radio" id="test-id" value="test-value">`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        expect(sut.name).toBe('radio');
    });

    /**
     *
     */
    test('id is not correct', async () => {
        await pageAdapter.driver.html(`<input type="radio" id="test-id" value="test-value">`);

        await expect(() => pageAdapter.element.byId('test-id-wrong')).rejects.toThrow(
            `element with strategy: 'id' and location: 'test-id-wrong' not found!`
        );
    });

    /**
     *
     */
    test('must not be visible', async () => {
        await pageAdapter.driver.html(`<input hidden type="radio" id="test-id" value="test-value">`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isDisplayed(element)).resolves.toBeFalsy();
    });

    /**
     *
     */
    test('must not be enabled', async () => {
        await pageAdapter.driver.html(`<input disabled type="radio" id="test-id" value="test-value">`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isEnabled(element)).resolves.toBeFalsy();
    });

    /**
     *
     */
    test('text must not be available', async () => {
        await pageAdapter.driver.html(`<input checked type="radio" id="test-id" value="test-value">`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);

        await expect(sut.getText(element)).resolves.toBe('');
    });

    /**
     *
     */
    test('text must be available', async () => {
        await pageAdapter.driver.html(`
        <input checked type="radio" id="test-id" value="test-value">
        <label for="test-id">Test-Value</label>`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);

        await expect(sut.getText(element)).resolves.toBe('Test-Value');
    });

    /**
     *
     */
    test('value must be available', async () => {
        await pageAdapter.driver.html(`<input checked type="radio" id="test-id" value="test-value">`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.getValue(element)).resolves.toBe('test-value');
    });

    /**
     *
     */
    test('classes must be visible', async () => {
        await pageAdapter.driver.html(`<input checked type="radio" id="test-id" value="test-value" class="test1 test2">`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.getClasses(element)).resolves.toStrictEqual(['test1', 'test2']);
    });

    /**
     *
     */
    test('element must be locatable by text', async () => {
        await pageAdapter.driver.html(`
          <input checked type="radio" id="test-id" value="test-value">
          <label for="test-id">Test-Text</label>`);
        const element = await pageAdapter.element.locator.findBy('text', 'Test-Text');

        const sut = await pageAdapter.element.getProxy(element);
        expect(sut.name).toBe('radio');
    });

    /**
     *
     */
    test('must throw error when element is not locatable', async () => {
        await pageAdapter.driver.html(`
          <input checked type="radio" id="test-id" value="test-value">
          <label for="test-id">Test-Text</label>`);

        await expect(() => pageAdapter.element.locator.findBy('text', 'Test-Text-Wrong')).rejects.toThrow(
            `element with strategy: 'text' and location: 'Test-Text-Wrong' not found!`
        );
    });

    /**
     *
     */
    test('element info must be accessible', async () => {
        await pageAdapter.driver.html(`
          <input checked type="radio" id="test-id" value="test-value" class="clazz1 clazz2">
          <label for="test-id">Test-Value</label>`);
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
            isRequired: false,
            proxyName: 'radio',
            tagName: 'input',
            value: 'test-value',
            text: 'Test-Value',
            tableInfo: undefined
        });
    });

    /**
     *
     */
    test('click must work', async () => {
        await pageAdapter.driver.html(`<input type="radio" id="test-id" value="test-value" class="test1 test2">`);

        const element = await pageAdapter.element.byId('test-id');
        const sut = await pageAdapter.element.getProxy(element);

        await expect(sut.isSelected(element)).resolves.toBe(false);
        await sut.click(element);
        await expect(sut.isSelected(element)).resolves.toBe(true);
    });
});
