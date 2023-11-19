import { Context, NativeContent, NullContent, ObjectContent, VariableParser } from '@boart/core';

import { ContextReplacer } from './ContextReplacer';

/**
 *
 */
const pegParser = new VariableParser();

/**
 *
 */
const sut = new ContextReplacer();

/**
 *
 */
it('get value - int', () => {
    const ast = pegParser.parseAction('context:a');

    Context.instance.put(ast, 1);
    expect(sut.replace(ast)).toBe('1');
});

/**
 *
 */
it('get value - boolean', () => {
    const ast = pegParser.parseAction('context:a');

    Context.instance.put(ast, true);
    expect(sut.replace(ast)).toBe('true');
});

/**
 *
 */
it('get value - null', () => {
    const ast = pegParser.parseAction('context:a');

    Context.instance.put(ast, null);
    expect(() => sut.replace(ast)).toThrow(`context 'a' not defined`);
});

/**
 *
 */
it('get value deep - null', () => {
    const ast = pegParser.parseAction('context:a#b');

    Context.instance.put(ast, null);
    expect(() => sut.replace(ast)).toThrow(`context 'a#b' not defined`);
});

/**
 *
 */
it('get value - null', () => {
    const ast = pegParser.parseAction('context:a');

    Context.instance.put(ast, null);
    expect(() => sut.replace(ast)).toThrow(`context 'a' not defined`);
});

/**
 *
 */
it('get value - nullContent', () => {
    const ast = pegParser.parseAction('context:a');

    Context.instance.put(ast, new NullContent());
    expect(() => sut.replace(ast)).toThrow(`context 'a' not defined`);
});

/**
 *
 */
it('get value - native undefined', () => {
    const ast = pegParser.parseAction('context:a');

    Context.instance.put(ast, new NativeContent(undefined));
    expect(() => sut.replace(ast)).toThrow(`context 'a' not defined`);
});

/**
 *
 */
it('get context value', () => {
    const ast = pegParser.parseAction('context:a');

    Context.instance.setContext({
        a: 1
    });
    expect(sut.replace(ast)).toBe('1');
});

/**
 *
 */
it('context value has higher priority', () => {
    const ast = pegParser.parseAction('context:a');

    Context.instance.put(ast, 1);
    Context.instance.setContext({
        a: 2
    });
    expect(sut.replace(ast)).toBe('2');
});

/**
 *
 */
it('context with structered context - 1', () => {
    const ast = pegParser.parseAction('context:a#b');

    Context.instance.setContext({
        a: {
            b: 1
        }
    });
    expect(sut.replace(ast)).toBe('1');
});

/**
 *
 */
it('context with structered context - 2', () => {
    const ast = pegParser.parseAction('context:a#b');

    Context.instance.setContext({
        a: {
            b: {}
        }
    });
    expect(sut.replace(ast)).toBe('{}');
});

/**
 *
 */
it('context with structered data contnetn', () => {
    const ast = pegParser.parseAction('context:a#b');

    Context.instance.setContext({
        a: {
            b: new ObjectContent({})
        }
    });
    expect(sut.replace(ast)).toBe('{}');
});
