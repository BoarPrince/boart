import { TextContent } from './TextContent';

/**
 *
 */
it('null', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    const sut = new TextContent(null as any);
    expect(sut.toJSON()).toBeNull();
});

/**
 *
 */
it('undefined', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    const sut = new TextContent(undefined as any);
    expect(sut.toJSON()).toBeUndefined();
});

/**
 *
 */
it('object', () => {
    const sut = new TextContent('{"a":1}');
    expect(sut.toJSON()).toBe('{"a":1}');
    expect(sut.getText()).toBe('{"a":1}');
});

/**
 *
 */
it('string', () => {
    const sut = new TextContent('a');
    expect(sut.toJSON()).toBe(JSON.stringify('a'));

    expect(sut.getText()).toBe('a');
    expect(sut.getValue()).toBe('a');
});
