import { WebPageAdapter, WebPageAdapterHandler } from '@boart/ui';
import initialize from '../index';

/**
 *
 */
describe('div-proxy', () => {
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
    test('must be a div proxy', async () => {
        await pageAdapter.driver.html('<div id="test-id"></div>');
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        expect(sut.name).toBe('div');
    });

    /**
     *
     */
    test('must not be visible', async () => {
        await pageAdapter.driver.html('<div hidden id="test-id"></div>');
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isDisplayed(element)).resolves.toBeFalsy();
    });

    /**
     *
     */
    test('must not be enabled', async () => {
        await pageAdapter.driver.html('<div disabled id="test-id"></div>');
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isEnabled(element)).resolves.toBeTruthy();
    });

    /**
     *
     */
    test('can be editable', async () => {
        await pageAdapter.driver.html('<div contenteditable id="test-id"></div>');
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isEditable(element)).resolves.toBeTruthy();
    });

    /**
     *
     */
    test('text must be available', async () => {
        await pageAdapter.driver.html(`<div id="test-id">test-div-text</div>`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.getText(element)).resolves.toBe('test-div-text');
    });

    /**
     *
     */
    test('classes must be visible', async () => {
        await pageAdapter.driver.html('<div id="test-id" class="test1  test2">test-button</div>');
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.getClasses(element)).resolves.toStrictEqual(['test1', 'test2']);
    });

    /**
     *
     */
    test('element must be locatable by text', async () => {
        await pageAdapter.driver.html('<div>test-div</div>');
        const element = await pageAdapter.element.locator.findBy('text', 'test-div');

        const sut = await pageAdapter.element.getProxy(element);
        expect(sut.name).toBe('div');
    });

    /**
     *
     */
    test('element info must be accessible', async () => {
        await pageAdapter.driver.html(`
            <div id="test-id" class="clazz1 clazz2">test-div-text</div>`);
        const element = await pageAdapter.element.byId('test-id');

        const sutElementInfo = await pageAdapter.element.getElementInfo(element);
        expect(sutElementInfo).toStrictEqual({
            ident: 'id:test-id',
            classes: ['clazz1', 'clazz2'],
            isDisplayed: true,
            isEditable: true,
            isEnabled: true,
            isSelected: false,
            isReadonly: undefined,
            isRequired: undefined,
            proxyName: 'div',
            tagName: 'div',
            value: 'test-div-text',
            text: 'test-div-text',
            tableInfo: undefined
        });
    });

    /**
     *
     */
    test('change div value', async () => {
        await pageAdapter.driver.html('<div contenteditable id="test-id"></div>');

        const element = await pageAdapter.element.byId('test-id');
        const sut = await pageAdapter.element.getProxy(element);

        await expect(sut.getValue(element)).resolves.toBe('');
        await sut.setValue('new value', element);
        await expect(sut.getValue(element)).resolves.toBe('new value');
    });
});
