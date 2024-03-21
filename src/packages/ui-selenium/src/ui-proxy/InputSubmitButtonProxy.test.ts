import { UIElementProxyInfo, WebPageAdapter, WebPageAdapterHandler } from '@boart/ui';
import initialize from '../index';

/**
 *
 */
describe('input-submit-button-proxy', () => {
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
    test('must be a submit button proxy', async () => {
        await pageAdapter.driver.html('<input type="submit" id="test"/>');
        const element = await pageAdapter.element.byId('test');

        const sut = await pageAdapter.element.getProxy(element);
        expect(sut.name).toBe('input-submit-button');
    });

    /**
     *
     */
    test('must be a submit button proxy when using strategy submit', async () => {
        await pageAdapter.driver.html('<input type="submit" id="test"/>');
        const element = await pageAdapter.element.locator.findBy('submit', null);

        const sut = await pageAdapter.element.getProxy(element);
        expect(sut.name).toBe('input-submit-button');
    });

    /**
     *
     */
    test('must be visible', async () => {
        await pageAdapter.driver.html('<input type="submit" id="test">test</input>');
        const element = await pageAdapter.element.byId('test');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isDisplayed(element)).resolves.toBeTruthy();
    });

    /**
     *
     */
    test('must not be visible', async () => {
        await pageAdapter.driver.html('<input type="submit" hidden id="test">test-button</input>');
        const element = await pageAdapter.element.byId('test');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isDisplayed(element)).resolves.toBeFalsy();
    });

    /**
     *
     */
    test('must be enabled', async () => {
        await pageAdapter.driver.html('<input type="submit" id="test">test-button</input>');
        const element = await pageAdapter.element.byId('test');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isEnabled(element)).resolves.toBeTruthy();
    });

    /**
     *
     */
    test('must not be enabled', async () => {
        await pageAdapter.driver.html('<input type="submit" disabled id="test">test-button</input>');
        const element = await pageAdapter.element.byId('test');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isEnabled(element)).resolves.toBeFalsy();
    });

    /**
     *
     */
    test('text must be available', async () => {
        await pageAdapter.driver.html('<input type="submit" id="test" value="test-input-button-text"/>');
        const element = await pageAdapter.element.byId('test');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.getText(element)).resolves.toBe('test-input-button-text');
    });

    /**
     *
     */
    test('classes must be visible', async () => {
        await pageAdapter.driver.html('<input type="submit" id="test" class="test1  test2">test-button</input>');
        const element = await pageAdapter.element.byId('test');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.getClasses(element)).resolves.toStrictEqual(['test1', 'test2']);
    });

    /**
     *
     */
    test('element must be locatable by text', async () => {
        await pageAdapter.driver.html('<input type="submit" value="test-input-button"/>');
        const element = await pageAdapter.element.locator.findBy('text', 'test-input-button');

        const sut = await pageAdapter.element.getProxy(element);
        expect(sut.name).toBe('input-submit-button');
    });

    /**
     *
     */
    test('element info must be accessible', async () => {
        await pageAdapter.driver.html(`<input type="submit" id="test-id" class="clazz1 clazz2" value="test-input-button-value"/>`);
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
            isRequired: undefined,
            proxyName: 'input-submit-button',
            tagName: 'input',
            value: 'test-input-button-value',
            text: 'test-input-button-value',
            tableInfo: undefined
        });
    });

    /**
     *
     */
    test('click must work', async () => {
        await pageAdapter.driver.html(`
          <input type="submit" id="test" onclick="clickHandler()"></input>
          <div id="test-2"></input>

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
