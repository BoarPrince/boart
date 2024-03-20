import { WebPageAdapter, WebPageAdapterHandler } from '@boart/ui';
import initialize from '../index';

/**
 *
 */
describe('button-proxy', () => {
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
        await pageAdapter.driver.html('<button id="test">test</button>');
        const element = await pageAdapter.element.byId('test');

        const sut = await pageAdapter.element.getProxy(element);
        expect(sut.name).toBe('button');
    });

    /**
     *
     */
    test('must be visible', async () => {
        await pageAdapter.driver.html('<button id="test">test</button>');
        const element = await pageAdapter.element.byId('test');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isDisplayed(element)).resolves.toBeTruthy();
    });

    /**
     *
     */
    test('must not be visible', async () => {
        await pageAdapter.driver.html('<button hidden id="test">test-button</button>');
        const element = await pageAdapter.element.byId('test');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isDisplayed(element)).resolves.toBeFalsy();
    });

    /**
     *
     */
    test('must be enabled', async () => {
        await pageAdapter.driver.html('<button id="test">test-button</button>');
        const element = await pageAdapter.element.byId('test');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isEnabled(element)).resolves.toBeTruthy();
    });

    /**
     *
     */
    test('must not be enabled', async () => {
        await pageAdapter.driver.html('<button disabled id="test">test-button</button>');
        const element = await pageAdapter.element.byId('test');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isEnabled(element)).resolves.toBeFalsy();
    });

    /**
     *
     */
    test('text must be available', async () => {
        await pageAdapter.driver.html('<button id="test">test-button</button>');
        const element = await pageAdapter.element.byId('test');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.getValue(element)).resolves.toBe('test-button');
    });

    /**
     *
     */
    test('classes must be visible', async () => {
        await pageAdapter.driver.html('<button id="test" class="test1  test2">test-button</button>');
        const element = await pageAdapter.element.byId('test');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.getClasses(element)).resolves.toStrictEqual(['test1', 'test2']);
    });

    /**
     *
     */
    test('element must be locatable by text', async () => {
        await pageAdapter.driver.html('<button>test-button</button>');
        const element = await pageAdapter.element.locator.findBy('text', 'test-button');

        const sut = await pageAdapter.element.getProxy(element);
        expect(sut.name).toBe('button');
    });

    /**
     *
     */
    test('element info must be accessible', async () => {
        await pageAdapter.driver.html('<button id="test" class="clazz1 clazz2">test-button</button>');
        const element = await pageAdapter.element.byId('test');

        const sutElementInfo = await pageAdapter.element.getElementInfo(element);
        expect(sutElementInfo).toStrictEqual({
            ident: 'id:test',
            classes: ['clazz1', 'clazz2'],
            isDisplayed: true,
            isEditable: true,
            isEnabled: true,
            isSelected: false,
            proxyName: 'button',
            tagName: 'button',
            value: 'test-button',
            text: 'test-button',
            tableInfo: undefined
        });
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
