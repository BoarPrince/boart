import { VariableParser } from '../parser/VariableParser';

import { Store } from './Store';

/**
 *
 */
const pegParser = new VariableParser();

/**
 *
 */
it('check test store', () => {
    const sut = Store.instance;

    const ast = pegParser.parseAction('store:a');
    sut.testStore.put(ast, 'b');

    expect(sut.testStore.get(ast).toString()).toBe('b');
});

/**
 *
 */
it('check local store', () => {
    const sut = Store.instance;

    const ast = pegParser.parseAction('store:a');
    sut.localStore.put(ast, 'b');

    expect(sut.localStore.get(ast).toString()).toBe('b');
});

/**
 *
 */
it('check global store', () => {
    const sut = Store.instance;

    const ast = pegParser.parseAction('store:a');
    sut.globalStore.put(ast, 'b');

    expect(sut.globalStore.get(ast).toString()).toBe('b');
});

/**
 *
 */
it('check step store', () => {
    const sut = Store.instance;

    const ast = pegParser.parseAction('store:a');
    sut.stepStore.put(ast, 'b');

    expect(sut.stepStore.get(ast).toString()).toBe('b');
});
