import { WebPageAdapter, WebPageAdapterHandler } from '@boart/ui';
import initialize from '../index';

/**
 *
 */
describe('any-proxy', () => {
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
    test('must be a any proxy', async () => {
        await pageAdapter.driver.html('<blockquote id="test-id"></blockquote>');
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        expect(sut.name).toBe('any');
    });

    /**
     *
     */
    test('must not be visible', async () => {
        await pageAdapter.driver.html('<blockquote hidden id="test-id"></blockquote>');
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isDisplayed(element)).resolves.toBeFalsy();
    });

    /**
     *
     */
    test('must not be enabled', async () => {
        await pageAdapter.driver.html('<blockquote disabled id="test-id"></blockquote>');
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isEnabled(element)).resolves.toBeTruthy();
    });

    /**
     *
     */
    test('can be editable', async () => {
        await pageAdapter.driver.html('<blockquote contenteditable id="test-id"></blockquote>');
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.isEditable(element)).resolves.toBeTruthy();
    });

    /**
     *
     */
    test('text must be available', async () => {
        await pageAdapter.driver.html(`<blockquote id="test-id">test-div-text</blockquote>`);
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.getText(element)).resolves.toBe('test-div-text');
    });

    /**
     *
     */
    test('classes must be visible', async () => {
        await pageAdapter.driver.html('<blockquote id="test-id" class="test1  test2">test-button</blockquote>');
        const element = await pageAdapter.element.byId('test-id');

        const sut = await pageAdapter.element.getProxy(element);
        await expect(sut.getClasses(element)).resolves.toStrictEqual(['test1', 'test2']);
    });

    /**
     *
     */
    test('element must be locatable by text', async () => {
        await pageAdapter.driver.html(`
          <blockquote>test-any</blockquote>
          <div>test-duv</div>`);
        const element = await pageAdapter.element.locator.findBy('text', 'test-any');

        const sut = await pageAdapter.element.getProxy(element);
        expect(sut.name).toBe('any');
    });

    /**
     *
     */
    test('element info must be accessible', async () => {
        await pageAdapter.driver.html(`
            <blockquote id="test-id" class="clazz1 clazz2">test-any-text</blockquote>`);
        const element = await pageAdapter.element.byId('test-id');

        const sutElementInfo = await pageAdapter.element.getElementInfo(element);
        expect(sutElementInfo).toStrictEqual({
            ident: 'id:test-id',
            classes: ['clazz1', 'clazz2'],
            isDisplayed: true,
            isEditable: false,
            isEnabled: true,
            isSelected: false,
            isReadonly: undefined,
            isRequired: undefined,
            proxyName: 'any',
            tagName: 'blockquote',
            value: 'test-any-text',
            text: 'test-any-text',
            tableInfo: undefined
        });
    });

    /**
     *
     */
    test('change div value', async () => {
        await pageAdapter.driver.html('<blockquote contenteditable id="test-id"></blockquote>');

        const element = await pageAdapter.element.byId('test-id');
        const sut = await pageAdapter.element.getProxy(element);

        await expect(sut.getValue(element)).resolves.toBe('');
        await sut.setValue('new value', element);
        await expect(sut.getValue(element)).resolves.toBe('new value');
    });
});
