import { UIElementProxyInfo, WebPageAdapter, WebPageAdapterHandler } from '@boart/ui';
import initialize from '../index';

/**
 *
 */
describe('select-proxy', () => {
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
    test('must be a select proxy', async () => {
        await pageAdapter.driver.html(`
          <select name="test-name" id="test-id">
            <option value="test-value">Test-Value</option>
          </select>`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        expect(sut.name).toBe('select');
    });

    /**
     *
     */
    test('id is not correct', async () => {
        await pageAdapter.driver.html(`
          <select name="test-name" id="test-id">
            <option value="test-value">Test-Value</option>
          </select>`);
        await expect(() => pageAdapter.element.byId('test-id-wrong')).rejects.toThrow(
            `element 'test-id-wrong' by strategy findBy:id not found!`
        );
    });

    /**
     *
     */
    test('must not be visible', async () => {
        await pageAdapter.driver.html(`
          <select hidden name="test-name" id="test-id">
            <option value="test-value">Test-Value</option>
          </select>`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isDisplayed(element)).resolves.toBeFalsy();
    });

    /**
     *
     */
    test('must not be enabled', async () => {
        await pageAdapter.driver.html(`
          <select disabled name="test-name" id="test-id">
            <option value="test-value">Test-Value</option>
          </select>`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isEnabled(element)).resolves.toBeFalsy();
    });

    /**
     *
     */
    test('text must be available', async () => {
        await pageAdapter.driver.html(`
          <select name="test-name" id="test-id">
            <option value="test-value">Test-Value</option>
            <option selected value="test-value-2">Test-Value-2</option>
          </select>`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.getText(element)).resolves.toBe('Test-Value-2');
    });

    /**
     *
     */
    test('value must be available', async () => {
        await pageAdapter.driver.html(`
          <select disabled name="test-name" id="test-id">
            <option selected value="test-value">Test-Value</option>
          </select>`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.getValue(element)).resolves.toBe('test-value');
    });

    /**
     *
     */
    test('classes must be visible', async () => {
        await pageAdapter.driver.html(`
          <select name="test-name" id="test-id" class="test1 test2">
            <option selected value="test-value">Test-Value</option>
          </select>`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.getClasses(element)).resolves.toStrictEqual(['test1', 'test2']);
    });

    /**
     *
     */
    test('element must be locatable by text', async () => {
        await pageAdapter.driver.html(`<label for="test-id">Test-Text</label>
        <select name="test-name" id="test-id">
          <option value="test-value">Test-Value</option>
        </select>`);
        const element = await pageAdapter.element.locator.findBy('text', 'Test-Text');

        const sut = await pageAdapter.element.getProxy(element);
        expect(sut.name).toBe('select');
    });

    /**
     *
     */
    test('must throw error when element is not locatable', async () => {
        await pageAdapter.driver.html(`<label for="test-id">Test-Text</label>`);
        await expect(() => pageAdapter.element.locator.findBy('text', 'Test-Text-Wrong')).rejects.toThrow(
            `element 'Test-Text-Wrong' by strategy findBy:text not found!`
        );
    });

    /**
     *
     */
    test('element info must be accessible', async () => {
        await pageAdapter.driver.html(`
          <select name="test-name" id="test-id" class="clazz1 clazz2">
            <option selected value="test-value">Test-Value</option>
            <option value="test-value-2">Test-Value-2</option>
          </select>`);
        const element = await pageAdapter.element.byId('test-id');

        const sutElementInfo = await pageAdapter.element.getElementInfo(element);
        expect(sutElementInfo).toStrictEqual<UIElementProxyInfo>({
            ident: 'id:test-id',
            classes: ['clazz1', 'clazz2'],
            isDisplayed: true,
            isEditable: true,
            isEnabled: true,
            isSelected: false,
            isReadonly: undefined,
            isRequired: false,
            proxyName: 'select',
            tagName: 'select',
            value: 'test-value',
            text: 'Test-Value',
            tableInfo: undefined
        });
    });

    /**
     *
     */
    test('value can be set', async () => {
        await pageAdapter.driver.html(`
          <select name="test-name" id="test-id">
            <option value="test-value-1">Test-Value-1</option>
            <option value="test-value-2">Test-Value-2</option>
          </select>`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await sut.setValue('test-value-2', element);

        await expect(sut.getValue(element)).resolves.toBe('test-value-2');
    });

    /**
     *
     */
    test('click must work', async () => {
        await pageAdapter.driver.html(`
          <button id="test" onclick="clickHandler()"></button>
          <div id="test-2"></button>

          <script>
            function clickHandler() {
              document.getElementById("test-2").innerHTML = "has clicked!";
            }
          </script>
          `);

        const element = await pageAdapter.element.byId('test');
        const sut = await pageAdapter.element.getProxy(element);
        await sut.click(element);

        const element2 = await pageAdapter.element.byId('test-2');
        const element2Proxy = await pageAdapter.element.getProxy(element2);
        await expect(element2Proxy.getValue(element2)).resolves.toBe('has clicked!');
    });
});
