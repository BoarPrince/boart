import { WebPageAdapter, WebPageAdapterHandler } from '@boart/ui';
import initialize from '../index';

/**
 *
 */
describe('input-proxy', () => {
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
        await pageAdapter.driver.html('<input id="test"/>');
        const element = await pageAdapter.element.byId('test');

        const sut = await pageAdapter.element.getProxy(element);
        expect(sut.name).toBe('input');
    });

    /**
     *
     */
    test('must be visible', async () => {
        await pageAdapter.driver.html('<input id="test"/>');
        const element = await pageAdapter.element.byId('test');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isDisplayed(element)).resolves.toBeTruthy();
    });

    /**
     *
     */
    test('must not be visible', async () => {
        await pageAdapter.driver.html('<input hidden id="test"/>');
        const element = await pageAdapter.element.byId('test');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isDisplayed(element)).resolves.toBeFalsy();
    });

    /**
     *
     */
    test('must be enabled', async () => {
        await pageAdapter.driver.html('<input id="test"/>');
        const element = await pageAdapter.element.byId('test');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isEnabled(element)).resolves.toBeTruthy();
    });

    /**
     *
     */
    test('must not be enabled', async () => {
        await pageAdapter.driver.html('<input disabled id="test"/>');
        const element = await pageAdapter.element.byId('test');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isEnabled(element)).resolves.toBeFalsy();
    });

    /**
     *
     */
    test('text must be available by placeholder', async () => {
        await pageAdapter.driver.html('<input id="test" placeholder="test-input-text"/>');
        const element = await pageAdapter.element.byId('test');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.getText(element)).resolves.toBe('test-input-text');
    });

    /**
     *
     */
    test('text must be available by assigned label', async () => {
        await pageAdapter.driver.html(`<input id="test-id"/>
          <label for="test-id">test-input-text</label>`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.getText(element)).resolves.toBe('test-input-text');
    });

    /**
     *
     */
    test('classes must be visible', async () => {
        await pageAdapter.driver.html('<input id="test" class="test1  test2">test-button</input>');
        const element = await pageAdapter.element.byId('test');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.getClasses(element)).resolves.toStrictEqual(['test1', 'test2']);
    });

    /**
     *
     */
    test('element must be locatable by placeholder', async () => {
        await pageAdapter.driver.html('<input placeholder="test-input"/>');
        const element = await pageAdapter.element.locator.findBy('text', 'test-input');

        const sut = await pageAdapter.element.getProxy(element);
        expect(sut.name).toBe('input');
    });

    /**
     *
     */
    test('element info must be accessible', async () => {
        await pageAdapter.driver.html(`
            <input id="test-id" class="clazz1 clazz2" value="test-input-value"/>
            <label for="test-id">test-input-text</label>`);
        const element = await pageAdapter.element.byId('test-id');

        const sutElementInfo = await pageAdapter.element.getElementInfo(element);
        expect(sutElementInfo).toStrictEqual({
            ident: 'id:test-id',
            classes: ['clazz1', 'clazz2'],
            isDisplayed: true,
            isEditable: true,
            isEnabled: true,
            isSelected: false,
            proxyName: 'input',
            tagName: 'input',
            value: 'test-input-value',
            text: 'test-input-text',
            tableInfo: undefined
        });
    });

    /**
     *
     */
    test('click must work', async () => {
        await pageAdapter.driver.html(`
          <input id="test" onclick="clickHandler()"/>
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
