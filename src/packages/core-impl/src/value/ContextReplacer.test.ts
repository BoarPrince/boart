import { Context, NativeContent, NullContent, ObjectContent } from '@boart/core';

import { ContextReplacer } from './ContextReplacer';

/**
 *
 */
const sut = new ContextReplacer();

/**
 *
 */
it('get value - int', () => {
    Context.instance.put('a', 1);
    expect(sut.replace('a')).toBe('1');
});

/**
 *
 */
it('get value - boolean', () => {
    Context.instance.put('a', true);
    expect(sut.replace('a')).toBe('true');
});

/**
 *
 */
it('get value - null', () => {
    Context.instance.put('a', null);
    expect(() => sut.replace('a')).toThrowError(`context 'a' not defined`);
});

/**
 *
 */
it('get value - nullContent', () => {
    Context.instance.put('a', new NullContent());
    expect(() => sut.replace('a')).toThrowError(`context 'a' not defined`);
});

/**
 *
 */
it('get value - native undefined', () => {
    Context.instance.put('a', new NativeContent(undefined));
    expect(() => sut.replace('a')).toThrowError(`context 'a' not defined`);
});

/**
 *
 */
it('get context value', () => {
    Context.instance.setContext({
        a: 1
    });
    expect(sut.replace('a')).toBe('1');
});

/**
 *
 */
it('context value has higher priority', () => {
    Context.instance.put('a', 1);
    Context.instance.setContext({
        a: 2
    });
    expect(sut.replace('a')).toBe('2');
});

/**
 *
 */
it('context with structered context - 1', () => {
    Context.instance.setContext({
        a: {
            b: 1
        }
    });
    expect(sut.replace('a.b')).toBe('1');
});

/**
 *
 */
it('context with structered context - 2', () => {
    Context.instance.setContext({
        a: {
            b: {}
        }
    });
    expect(sut.replace('a.b')).toBe('{}');
});

/**
 *
 */
it('context with structered data contnetn', () => {
    Context.instance.setContext({
        a: {
            b: new ObjectContent({})
        }
    });
    expect(sut.replace('a.b')).toBe('{}');
});
